import * as XLSX from 'xlsx-js-style'

/**
 * ThemeList.xlsx layout:
 *   Row 5 (index 4): Main category headers spanning merged columns
 *                    Pattern: /^\d{2}\./  → "01. IT Strategy", "02. Information Security"
 *
 *   Rows 6+: Each column contains sub-categories AND themes mixed together going downward.
 *            Sub-category pattern: /^\d+\.\d+\.\s/   → "1.1. Strategy & Planning"
 *                                  exactly 2 numeric levels + dot + space
 *                                  (NOT matching 1.1.1 — the extra \.\s guard prevents it)
 *            Theme pattern:        /^\d+\.\d+\.\d+/  → "1.1.1. Management Reporting"
 *                                  exactly 3 numeric levels
 *
 *   Hierarchy is derived purely from pattern, not row position:
 *     01 owns all 1.x sub-categories
 *     1.1 owns all 1.1.x themes
 *     02 owns all 2.x sub-categories
 *     2.1 owns all 2.1.x themes  ...etc.
 */

// Classify purely by number of dots in the leading numeric prefix:
//   01.       → 1 dot → main category
//   1.1.      → 2 dots → sub-category
//   1.1.1.    → 3 dots → theme
const _dotCount = (v) => { const m = v.match(/^[\d.]+/); return m ? m[0].split('.').length - 1 : 0 }
const isMainCat = (v) => _dotCount(v) === 1
const isSubCat  = (v) => _dotCount(v) === 2
const isTheme   = (v) => _dotCount(v) === 3
const toLabel   = (v) => v.replace(/^[\d.]+\s*/, '').trim()

export function parseThemeList(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb     = XLSX.read(e.target.result, { type: 'array' })
        const ws     = wb.Sheets[wb.SheetNames[0]]
        const range  = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50')
        const maxRow = range.e.r
        const maxCol = range.e.c

        const getCell = (r, c) => {
          const cell = ws[XLSX.utils.encode_cell({ r, c })]
          return cell ? String(cell.v ?? '').trim() : ''
        }

        // ── Row 5 (index 4): main category headers ──────────────────────────
        const MAIN_ROW   = 4
        const DATA_START = 5

        // Build colToMain — forward-fill across merged cells
        const colToMain = {}
        let lastMain = ''
        for (let c = 0; c <= maxCol; c++) {
          const v = getCell(MAIN_ROW, c)
          if (v && isMainCat(v)) lastMain = v
          colToMain[c] = lastMain
        }
        // Also apply XLSX merge metadata explicitly
        for (const m of (ws['!merges'] || [])) {
          if (m.s.r === MAIN_ROW) {
            const v = getCell(m.s.r, m.s.c)
            if (v && isMainCat(v)) {
              for (let c = m.s.c; c <= m.e.c; c++) colToMain[c] = v
            }
          }
        }

        // ── Scan each column downward, tracking sub-category context ─────────
        const themes = []
        const seen   = new Set()

        for (let c = 1; c <= maxCol; c++) {
          const mainCategory = colToMain[c] || ''
          if (!mainCategory) continue

          let currentSubCat = ''

          for (let r = DATA_START; r <= maxRow; r++) {
            const v = getCell(r, c)
            if (!v) continue

            if (isSubCat(v)) {
              // Update sub-category context — do NOT emit as a theme
              currentSubCat = v
            } else if (isTheme(v)) {
              const key = `${mainCategory}||${currentSubCat}||${v}`
              if (seen.has(key)) continue
              seen.add(key)
              themes.push({
                mainCategory,
                subCategory: currentSubCat,
                theme:       v,
                themeLabel:  toLabel(v),  // e.g. "Management Reporting"
              })
            }
            // isMainCat values in data rows = noise, skip
          }
        }

        console.log(`[ThemeList] Parsed ${themes.length} themes`)
        console.log('[ThemeList] Sample:', themes.slice(0, 6).map(
          t => `${t.mainCategory} > ${t.subCategory} > ${t.theme}`
        ))
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
 * Each sheet = one framework. Header row found dynamically by looking for
 * a row containing both "requirement" and "theme/themes" columns.
 */
export function parseFrameworkWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb           = XLSX.read(e.target.result, { type: 'array' })
        const frameworkMap = new Map()
        const frameworks   = []

        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName]
          if (!ws['!ref']) continue

          const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

          let headerRowIdx = -1
          const colMap     = {}

          for (let i = 0; i < Math.min(20, raw.length); i++) {
            const rowLow = raw[i].map(c => String(c || '').toLowerCase().trim())
            const hasReq   = rowLow.some(c => c.includes('requirement'))
            const hasTheme = rowLow.some(c => c === 'theme' || c === 'themes')
            if (hasReq && hasTheme) {
              headerRowIdx = i
              rowLow.forEach((key, idx) => {
                if (key.includes('source'))                        colMap.sourceName    = idx
                if (key === 'topic' || key === 'topics')           colMap.topic         = idx
                if (key.includes('sub') && key.includes('topic'))  colMap.subTopic      = idx
                if (key.includes('section'))                       colMap.sectionNumber = idx
                if (key.includes('requirement'))                   colMap.requirements  = idx
                if (key === 'theme' || key === 'themes')           colMap.theme         = idx
              })
              break
            }
          }

          if (headerRowIdx === -1 || colMap.requirements === undefined || colMap.theme === undefined) {
            console.warn(`[Workbook] Skipping "${sheetName}" — header not found`)
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
          console.log(`[Workbook] "${sheetName}": ${added} rows (headerRow=${headerRowIdx})`)
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
 * 1. Exact label match
 * 2. Normalised match (strips punctuation/symbols)
 */
export function buildCombinedRows(themeList, frameworkMap, frameworks) {
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
    if (frameworkMap.has(themeLabel)) return frameworkMap.get(themeLabel)
    const n = norm(themeLabel)
    if (normIndex.has(n)) return normIndex.get(n)
    return []
  }

  const rows = themeList.map(({ mainCategory, subCategory, theme, themeLabel }) => {
    const matches = findMatches(themeLabel)

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
  const unmatched = themeList
    .filter((t, i) => !rows[i]._hasFrameworkData)
    .map(t => t.themeLabel)
  if (unmatched.length) console.warn('[Match] Unmatched:', unmatched)

  return rows
}
