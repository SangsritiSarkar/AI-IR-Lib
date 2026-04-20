// src/utils/exportCSV.js
// Uses ExcelJS for full styling, freeze panes, colors, bold, wrap text

// ── Clean recentChanges into bullet-per-line format ─────────────────────────
function cleanBullets(value) {
  if (!value) return "";

  let items = [];

  if (Array.isArray(value)) {
    items = value.map(v => String(v));
  } else {
    const str = String(value);
    if (str.includes("|")) {
      items = str.split("|");
    } else if (str.includes("\u2022")) {
      items = str.split("\u2022");
    } else if (str.includes("\n")) {
      items = str.split("\n");
    } else {
      items = [str];
    }
  }

  return items
    .map(b => b
      .replace(/^[\s\u2022|\-\[\]"']+/, "")
      .replace(/\]/g, "")
      .replace(/[\["'\s,]+$/, "")
      .trim()
    )
    .filter(b => b.length > 2)
    .map(b => "\u2022 " + b)
    .join("\n");
}

// ── Main export function (async — ExcelJS uses Promises) ────────────────────
export async function exportCSV(frameworks, results, newFWs, timeRange) {
  const ExcelJS = window.ExcelJS;
  if (!ExcelJS) {
    alert("ExcelJS not loaded \u2014 cannot export.");
    return;
  }

  const wb = new ExcelJS.Workbook();

  // ── Style constants ─────────────────────────────────────────────────────
  const purpleFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F2D7F" },
  };

  const blackFill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF000000" },
  };

  const whiteFont = {
    bold: true,
    color: { argb: "FFFFFFFF" },
    size: 12,
  };

  const headerBorder = {
    top:    { style: "thin", color: { argb: "FFFFFFFF" } },
    bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
    left:   { style: "thin", color: { argb: "FFFFFFFF" } },
    right:  { style: "thin", color: { argb: "FFFFFFFF" } },
  };

  const headerAlignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  const dataAlignment = {
    vertical: "top",
    wrapText: true,
  };

  // ════════════════════════════════════════════════════════════════════════
  // SHEET 1: Scanned Frameworks
  // ════════════════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet("Scanned Frameworks", {
    views: [{ state: "frozen", xSplit: 3, ySplit: 1 }],
  });

  // Column definitions
  ws.columns = [
    { header: "Framework Name",        key: "name",       width: 35 },
    { header: "URL",                   key: "url",        width: 40 },
    { header: "Last known Version",    key: "version",    width: 20 },
    { header: "Current Version",       key: "current",    width: 50 },
    { header: "Recent Changes",        key: "changes",    width: 90 },
    { header: "Upcoming Changes",      key: "upcoming",   width: 50 },
    { header: "Compliance Implications", key: "implications", width: 55 },
  ];

  // ── Header row styling ────────────────────────────────────────────────
  const headerRow = ws.getRow(1);
  headerRow.height = 40;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = whiteFont;
    cell.alignment = headerAlignment;
    // First 3 columns: dark purple, rest: black
    cell.fill = colNumber <= 3 ? purpleFill : blackFill;
    cell.border = headerBorder;
  });

  // ── Data rows ─────────────────────────────────────────────────────────
  frameworks.forEach((f, i) => {
    const r = results[i];
    const d = r?.status === "done" && r.data ? r.data : {};

    const row = ws.addRow({
      name:         f.name    ?? "",
      url:          f.url     ?? "",
      version:      f.version ?? "",
      current:      d.currentVersion ?? "",
      changes:      cleanBullets(d.recentChanges),
      upcoming:     d.upcoming       ?? "",
      implications: d.implications   ?? "",
    });

    // Apply wrap + top alignment to every data cell
    row.eachCell(cell => {
      cell.alignment = dataAlignment;
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // SHEET 2: Discovered Frameworks (optional)
  // ════════════════════════════════════════════════════════════════════════
  if (newFWs && newFWs.length > 0) {
    const ws2 = wb.addWorksheet("Discovered Frameworks");

    ws2.columns = [
      { header: "Name",           key: "name",      width: 40 },
      { header: "Type",           key: "type",      width: 15 },
      { header: "Region",         key: "region",    width: 15 },
      { header: "Published Date", key: "pubDate",   width: 18 },
      { header: "Relevance",      key: "relevance", width: 12 },
      { header: "Description",    key: "desc",      width: 65 },
      { header: "URL",            key: "url",       width: 40 },
    ];

    // Header row styling
    const hRow2 = ws2.getRow(1);
    hRow2.height = 35;
    hRow2.eachCell(cell => {
      cell.fill = blackFill;
      cell.font = whiteFont;
      cell.alignment = headerAlignment;
    });

    // Data rows
    newFWs.forEach(fw => {
      const row = ws2.addRow({
        name:      fw.name          ?? "",
        type:      fw.type          ?? "",
        region:    fw.region        ?? "",
        pubDate:   fw.publishedDate ?? "",
        relevance: fw.relevance     ?? "",
        desc:      fw.description   ?? "",
        url:       fw.url           ?? "",
      });
      row.eachCell(cell => {
        cell.alignment = dataAlignment;
      });
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // DOWNLOAD
  // ════════════════════════════════════════════════════════════════════════
  const today = new Date().toISOString().slice(0, 10);
  const fileName = "CyberScan_Report_" + timeRange + "_" + today + ".xlsx";

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
