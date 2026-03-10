import * as XLSX from 'xlsx-js-style'

/**
 * CONFIRMED LAYOUT from actual files:
 *
 * ThemeList.xlsx — WIDE/COLUMNAR layout:
 *   Row 5: Main category headers across columns B-N (with merged cells spanning)
 *          B5="01. IT Strategy", C5="02. Information Security", E5="03. Infrastructure Security"...
 *   Row 6: Sub-category headers — one per column
 *          B6="1.1.Strategy & Planning", C6="2.1. Identity & Access Management", D6="2.4. Logging"...
 *   Rows 7-43: Theme values going DOWN each column
 *          B7="1.1.1. Management Reporting", B8="1.1.2. IT Strategy"...
 *          C7="2.1.1. User Access Provisioning"...
 *
 * Framework Workbook — each sheet:
 *   Row 3: Headers — col B=Source Name, C=Topic, D=Sub Topic, E=Section Number, F=Requirement, G=Themes
 *   Row 4+: Data
 *   Theme column (G) contains LABEL-ONLY values like "IT Policies and Standards Management"
 *   (NO number prefix — just the name after the dot in ThemeList)
 */

/**
 * Parse ThemeList — wide columnar layout.
 * Returns [ { mainCategory, subCategory, theme, themeLabel } ]
 * themeLabel = label part only e.g. "Management Reporting" (used for matching workbook)
 */
export function parseThemeList(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb    = XLSX.read(e.target.result, { type: 'array' })
        const ws    = wb.Sheets[wb.SheetNames[0]]
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50')
        const maxRow = range.e.r
        const maxCol = range.e.c

        const getCell = (r, c) => {
          const cell = ws[XLSX.utils.encode_cell({ r, c })]
          return cell ? String(cell.v ?? '').trim() : ''
        }

        // ── Row 5 (index 4) = main category headers ──────────────────────────
        // ── Row 6 (index 5) = sub-category headers ───────────────────────────
        const MAIN_ROW = 4   // 0-indexed
        const SUB_ROW  = 5
        const DATA_START = 6

        // Build main category map per column
        // Main cats span merged columns — forward-fill from last seen value
        const colToMain = {}
        let lastMain = ''
        for (let c = 0; c <= maxCol; c++) {
          const v = getCell(MAIN_ROW, c)
          if (v) lastMain = v
          colToMain[c] = lastMain
        }

        // Also handle XLSX merged cells explicitly
        const merges = ws['!merges'] || []
        for (const m of merges) {
          if (m.s.r === MAIN_ROW) {
            const v = getCell(m.s.r, m.s.c)
            if (v) {
              for (let c = m.s.c; c <= m.e.c; c++) colToMain[c] = v
            }
          }
        }

        // Build sub-category map per column (row 6, no merging needed)
        const colToSub = {}
        for (let c = 0; c <= maxCol; c++) {
          colToSub[c] = getCell(SUB_ROW, c)
        }

        // ── Collect all theme entries from rows 7-43 ─────────────────────────
        const isTheme = (v) => /^\d+\.\d+\.\d+/.test(v)
        // Strip leading number prefix: "1.1.1. Management Reporting" → "Management Reporting"
        const toLabel = (v) => v.replace(/^\d[\d.]*\.\s*/, '').trim()

        const themes = []
        const seen   = new Set()

        // Iterate COLUMN-FIRST so all themes under one main category come together:
        // All of col B (01. IT Strategy) first, then col C (02. Information Security), etc.
        for (let c = 1; c <= maxCol; c++) {   // skip col 0 (row numbers)
          for (let r = DATA_START; r <= maxRow; r++) {
            const v = getCell(r, c)
            if (!v || !isTheme(v)) continue

            const mainCategory = colToMain[c] || ''
            const subCategory  = colToSub[c]  || ''
            if (!mainCategory) continue

            const key = `${mainCategory}||${subCategory}||${v}`
            if (seen.has(key)) continue
            seen.add(key)

            themes.push({
              mainCategory,
              subCategory,
              theme:      v,
              themeLabel: toLabel(v),   // e.g. "Management Reporting"
            })
          }
        }

        console.log(`[ThemeList] Parsed ${themes.length} themes`)
        console.log('[ThemeList] Sample:', themes.slice(0, 5))
        resolve(themes)
      } catch (err) {
        reject(new Error('Failed to parse ThemeList: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read ThemeList file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse Framework Workbook.
 * Each sheet = one framework (sheet name = column header in output).
 * Header row is row 3 (index 2). Columns: B=Source, C=Topic, D=SubTopic, E=Section, F=Requirement, G=Themes
 * Theme column contains label-only values (no number prefix).
 */
export function parseFrameworkWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb           = XLSX.read(e.target.result, { type: 'array' })
        const frameworkMap = new Map()   // themeLabel → [row objects]
        const frameworks   = []

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          if (!ws['!ref']) continue

          const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

          // Find header row — look for row with "requirement" AND ("theme" or "themes")
          let headerRowIdx = -1
          const colMap     = {}

          for (let i = 0; i < Math.min(20, raw.length); i++) {
            const rowLow = raw[i].map(c => String(c || '').toLowerCase().trim())
            const hasReq   = rowLow.some(c => c.includes('requirement'))
            const hasTheme = rowLow.some(c => c === 'theme' || c === 'themes')
            if (hasReq && hasTheme) {
              headerRowIdx = i
              rowLow.forEach((key, idx) => {
                if (key.includes('source'))                         colMap.sourceName    = idx
                if (key === 'topic' || key === 'topics')            colMap.topic         = idx
                if (key.includes('sub') && key.includes('topic'))   colMap.subTopic      = idx
                if (key.includes('section'))                        colMap.sectionNumber = idx
                if (key.includes('requirement'))                    colMap.requirements  = idx
                if (key === 'theme' || key === 'themes')            colMap.theme         = idx
              })
              break
            }
          }

          if (headerRowIdx === -1 || colMap.requirements === undefined || colMap.theme === undefined) {
            console.warn(`[Workbook] Skipping sheet "${sheetName}" — header not found. colMap:`, colMap)
            continue
          }

          const frameworkName = sheetName.trim()
          if (!frameworks.includes(frameworkName)) frameworks.push(frameworkName)

          let added = 0
          for (let i = headerRowIdx + 1; i < raw.length; i++) {
            const row = raw[i]
            if (!row || row.every(c => String(c).trim() === '')) continue

            const themeLabel   = String(row[colMap.theme]        ?? '').trim()
            const requirements = String(row[colMap.requirements] ?? '').trim()
            if (!themeLabel || !requirements) continue

            if (!frameworkMap.has(themeLabel)) frameworkMap.set(themeLabel, [])
            frameworkMap.get(themeLabel).push({
              framework:     frameworkName,
              sourceName:    String(row[colMap.sourceName]    ?? frameworkName).trim(),
              topic:         String(row[colMap.topic]         ?? '').trim(),
              subTopic:      String(row[colMap.subTopic]      ?? '').trim(),
              sectionNumber: String(row[colMap.sectionNumber] ?? '').trim(),
              requirements,
              themeLabel,
            })
            added++
          }
          console.log(`[Workbook] "${sheetName}": ${added} rows loaded (headerRow=${headerRowIdx}, themeCol=${colMap.theme})`)
        }

        console.log(`[Workbook] ${frameworks.length} frameworks, ${frameworkMap.size} unique theme labels`)
        resolve({ frameworkMap, frameworks })
      } catch (err) {
        reject(new Error('Failed to parse Framework Workbook: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read Framework Workbook'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Match ThemeList entries against framework data.
 * Matching strategy (in order):
 *   1. Exact label match          "Management Reporting" == "Management Reporting"
 *   2. Normalised (strip symbols) handles "&" vs "and", extra spaces, slash variants
 */
export function buildCombinedRows(themeList, frameworkMap, frameworks) {
  // Build normalised index
  const norm = (s) => s.toLowerCase()
    .replace(/\s*\/\s*/g, '/')
    .replace(/[^a-z0-9/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const normIndex = new Map()
  for (const [label, rows] of frameworkMap.entries()) {
    normIndex.set(norm(label), rows)
  }

  const findMatches = (themeLabel) => {
    // 1. Exact
    if (frameworkMap.has(themeLabel)) return frameworkMap.get(themeLabel)
    // 2. Normalised
    const n = norm(themeLabel)
    if (normIndex.has(n)) return normIndex.get(n)
    return []
  }

  const rows = themeList.map(({ mainCategory, subCategory, theme, themeLabel }) => {
    const matches = findMatches(themeLabel)

    // Build per-framework section numbers (fallback to topic)
    const frameworkSections = {}
    for (const fw of frameworks) {
      const fwRows = matches.filter(r => r.framework === fw)
      if (fwRows.length === 0) {
        frameworkSections[fw] = ''
      } else {
        const vals = fwRows
          .map(r => r.sectionNumber?.trim() || r.topic?.trim() || '')
          .filter(Boolean)
        frameworkSections[fw] = [...new Set(vals)].join('\n')
      }
    }

    return {
      mainCategory,
      subCategory,
      theme,
      allRequirements:     matches.map(r => ({ framework: r.framework, text: r.requirements })),
      controlRequirements: '',
      testProcedures:      '',
      riskNarratives:      '',
      frameworkSections,
      _hasFrameworkData:   matches.length > 0,
    }
  })

  const matched = rows.filter(r => r._hasFrameworkData).length
  console.log(`[Match] ${matched} / ${rows.length} themes matched`)
  if (matched < rows.length) {
    const unmatched = themeList
      .filter((t, i) => !rows[i]._hasFrameworkData)
      .map(t => t.themeLabel)
    console.warn('[Match] Unmatched labels:', unmatched)
  }

  return rows
}
