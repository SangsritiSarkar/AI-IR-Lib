/**
 * Excel exporter using xlsx-js-style.
 *
 * Row layout matching Image 2 exactly:
 *   Row 1-2: spacers
 *   Row 3:   Title "Unified Risk and Control Framework" — black bg, merged all cols
 *   Row 4:   spacer
 *   Row 5:   Section headers:
 *              cols 1-6  → "Unified Risk and Control Framework"  (violet)
 *              col  7    → "Risk Narrative Mapping"              (dark teal)
 *              cols 8+   → "Authoritative Source Overlay"        (dark navy)
 *   Row 6:   Column headers — dark navy bg, white bold
 *   Row 7+:  Data rows
 *
 * Section column mapping (0-indexed):
 *   0 = #
 *   1 = Main Category
 *   2 = Sub-category
 *   3 = Theme
 *   4 = Control Requirements
 *   5 = Test Procedures
 *   6 = Risk Narratives        ← "Risk Narrative Mapping"
 *   7+ = framework cols        ← "Authoritative Source Overlay"
 */
import XLSXStyle from 'xlsx-js-style'

export function exportToExcel(rows, frameworks) {
  const totalCols = 7 + frameworks.length
  const aoa = []

  // ── Row 1-2: spacers ─────────────────────────────────────────────────────
  aoa.push(Array(totalCols).fill({ v: '', t: 's' }))
  aoa.push(Array(totalCols).fill({ v: '', t: 's' }))

  // ── Row 3: Title ─────────────────────────────────────────────────────────
  const titleRow = Array(totalCols).fill({ v: '', t: 's', s: S.titleFill })
  titleRow[0] = { v: 'Unified Risk and Control Framework', t: 's', s: S.title }
  aoa.push(titleRow)

  // ── Row 4: spacer ────────────────────────────────────────────────────────
  aoa.push(Array(totalCols).fill({ v: '', t: 's' }))

  // ── Row 5: Section group headers ─────────────────────────────────────────
  //   cols 0-5  → violet  "Unified Risk and Control Framework"
  //   col  6    → teal    "Risk Narrative Mapping"
  //   cols 7+   → navy    "Authoritative Source Overlay"
  const secRow = Array(totalCols).fill({ v: '', t: 's' })
  for (let c = 0; c <= 5; c++)
    secRow[c] = { v: c === 0 ? 'Unified Risk and Control Framework' : '', t: 's', s: S.secViolet }
  secRow[6] = { v: 'Risk Narrative Mapping', t: 's', s: S.secTeal }
  for (let c = 7; c < totalCols; c++)
    secRow[c] = { v: c === 7 ? 'Authoritative Source Overlay' : '', t: 's', s: S.secNavy }
  aoa.push(secRow)

  // ── Row 6: Small spacer between section headers and column headers ──────────
  aoa.push(Array(totalCols).fill({ v: '', t: 's' }))

  // ── Row 7: Column headers ─────────────────────────────────────────────────
  const headers = [
    '#', 'Main Category', 'Sub-category', 'Theme',
    'Control Requirements', 'Test Procedures', 'Risk Narratives',
    ...frameworks,
  ]
  aoa.push(headers.map(v => ({ v, t: 's', s: S.colHeader })))

  // ── Row 8+: Data rows ─────────────────────────────────────────────────────
  rows.forEach((row, idx) => {
    const even = idx % 2 === 0
    const ds = even ? S.dataEven  : S.dataOdd
    const fs = even ? S.fwEven    : S.fwOdd
    const ns = even ? S.numEven   : S.numOdd
    const ts = even ? S.themeEven : S.themeOdd
    const rs = even ? S.rnEven    : S.rnOdd
    aoa.push([
      { v: idx + 1,                      t: 'n', s: ns },
      { v: row.mainCategory        || '', t: 's', s: ds },
      { v: row.subCategory         || '', t: 's', s: ds },
      { v: row.theme               || '', t: 's', s: ts },
      { v: row.controlRequirements || '', t: 's', s: ds },
      { v: row.testProcedures      || '', t: 's', s: ds },
      { v: row.riskNarratives      || '', t: 's', s: rs },
      ...frameworks.map(fw => ({ v: row.frameworkSections?.[fw] || '', t: 's', s: fs })),
    ])
  })

  // ── Create worksheet ──────────────────────────────────────────────────────
  const ws = XLSXStyle.utils.aoa_to_sheet(aoa)

  // ── Merges ────────────────────────────────────────────────────────────────
  ws['!merges'] = [
    // Row 3: title — all cols
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    // Row 5: section headers
    { s: { r: 4, c: 0 }, e: { r: 4, c: 5             } },  // violet: cols 0-5
    { s: { r: 4, c: 6 }, e: { r: 4, c: 6             } },  // teal:   col 6 only
    { s: { r: 4, c: 7 }, e: { r: 4, c: totalCols - 1 } },  // navy:   cols 7+
  ]

  // ── Column widths ─────────────────────────────────────────────────────────
  ws['!cols'] = [
    { wch: 5  },   // #
    { wch: 22 },   // Main Category
    { wch: 28 },   // Sub-category
    { wch: 32 },   // Theme
    { wch: 55 },   // Control Requirements
    { wch: 48 },   // Test Procedures
    { wch: 40 },   // Risk Narratives
    ...frameworks.map(() => ({ wch: 20 })),
  ]

  // ── Row heights (hpt = height in points) ─────────────────────────────────
  ws['!rows'] = [
    { hpt: 12  },  // row 1 spacer
    { hpt: 12  },  // row 2 spacer
    { hpt: 32  },  // row 3 title
    { hpt: 10  },  // row 4 spacer
    { hpt: 40  },  // row 5 section headers — taller
    { hpt: 6   },  // row 6 small gap spacer
    { hpt: 28  },  // row 7 column headers — shorter
    ...rows.map(() => ({ hpt: 100 })),  // data rows
  ]

  // ── Write workbook ────────────────────────────────────────────────────────
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Unified Framework')
  XLSXStyle.writeFile(wb, 'Unified_Risk_Control_Framework.xlsx')
}

// ── Style helpers ─────────────────────────────────────────────────────────
const F   = { name: 'Calibri', sz: 10 }
const bdr = (rgb = 'D0D7E5') => {
  const s = { style: 'thin', color: { rgb } }
  return { top: s, bottom: s, left: s, right: s }
}

const S = {
  // Row 3 title
  title: {
    font:      { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
    fill:      { patternType: 'solid', fgColor: { rgb: '000000' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  },
  titleFill: {
    fill: { patternType: 'solid', fgColor: { rgb: '000000' } },
  },

  // Row 5 section headers
  secViolet: {
    font:      { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
    fill:      { patternType: 'solid', fgColor: { rgb: '7B2C8F' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  },
  secTeal: {
    font:      { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
    fill:      { patternType: 'solid', fgColor: { rgb: '1E5C7B' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  },
  secNavy: {
    font:      { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
    fill:      { patternType: 'solid', fgColor: { rgb: '1B3A6B' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  },

  // Row 6 column headers
  colHeader: {
    font:      { name: 'Calibri', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    fill:      { patternType: 'solid', fgColor: { rgb: '1B2A4A' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    bdr('0F1D35'),
  },

  // Data rows — fixed cols (even/odd)
  dataEven: {
    font:      { ...F, color: { rgb: '1A1A2E' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },
  dataOdd: {
    font:      { ...F, color: { rgb: '1A1A2E' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'F0F3F8' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },

  // Theme col — violet bold text
  themeEven: {
    font:      { ...F, bold: true, color: { rgb: '5B21B6' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },
  themeOdd: {
    font:      { ...F, bold: true, color: { rgb: '5B21B6' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'F0F3F8' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },

  // Risk Narratives col — white background (clean, no tint)
  rnEven: {
    font:      { ...F, color: { rgb: '1A1A2E' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },
  rnOdd: {
    font:      { ...F, color: { rgb: '1A1A2E' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'F0F3F8' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr(),
  },

  // # col
  numEven: {
    font:      { ...F, color: { rgb: '64748B' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'top' },
    border:    bdr(),
  },
  numOdd: {
    font:      { ...F, color: { rgb: '64748B' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'F0F3F8' } },
    alignment: { horizontal: 'center', vertical: 'top' },
    border:    bdr(),
  },

  // Framework cols — consistent light blush pink (no alternating), left-aligned stacked text
  fwEven: {
    font:      { ...F, color: { rgb: '1B2A4A' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFE4E1' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr('C8D0DC'),
  },
  fwOdd: {
    font:      { ...F, color: { rgb: '1B2A4A' } },
    fill:      { patternType: 'solid', fgColor: { rgb: 'FFE4E1' } },
    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
    border:    bdr('C8D0DC'),
  },
}
