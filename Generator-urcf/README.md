# Unified Risk & Control Framework Builder

An AI-powered web application that consolidates multiple cybersecurity frameworks into a single unified risk and control framework.

## Features

- 📂 **Upload** Framework Workbook (multi-sheet Excel) + ThemeList Excel
- 🔗 **Maps** all requirements to themes from the ThemeList hierarchy
- 🤖 **AI Generation** via Azure GPT-4o:
  - Control Requirements (consolidated jist from all frameworks per theme)
  - Test Procedures
  - Risk Narratives
- 📊 **Interactive Table** with:
  - Column sorting & filtering
  - Global search
  - Sticky first 4 columns (Main Category, Sub-category, Theme)
  - Row expand for full AI content
  - Column resize
  - Pagination
- 🌗 **Dark / Light mode** toggle
- 📥 **Excel Export** with professional styled output matching the Unified Risk & Control Framework format

## Setup

### Prerequisites
- Node.js 18+ 
- npm 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## File Format Requirements

### Framework Workbook (Excel)
- **Multi-sheet workbook** — each sheet represents one framework
- **Sheet name** = Framework name (e.g., "NIST CSF 2.0", "NIS 2", "TISAX")
- **Required columns** (flexible header matching):
  | Column | Description |
  |--------|-------------|
  | Source Name | Framework identifier |
  | Topic | High-level topic |
  | Sub Topic | Sub-topic classification |
  | Section Number | Framework section reference (e.g., GV.OC-01) |
  | Requirements | The control requirement text |
  | Theme | Must match themes in ThemeList |

### ThemeList Excel
- **Single sheet** with hierarchical structure
- Uses numbered naming convention:
  - Main Category: `01. IT Strategy`
  - Sub-category: `1.1. Strategy & Planning`
  - Theme: `1.1.1. Management Reporting`

---

## Azure OpenAI Configuration

Click **Settings** in the top bar and enter:

| Field | Description | Example |
|-------|-------------|---------|
| Azure Endpoint | Your Azure OpenAI resource URL | `https://my-resource.openai.azure.com` |
| API Key | Your Azure OpenAI API key | `abc123...` |
| Deployment Name | Your GPT-4o deployment name | `gpt-4o` |
| API Version | Azure OpenAI API version | `2024-02-01` |

Use **Test Connection** to verify before generating.

---

## Output Excel Structure

The downloaded Excel matches the Unified Risk and Control Framework format:

| Row | Content | Style |
|-----|---------|-------|
| 3 | "Unified Risk and Control Framework" title | Black background, white text |
| 5 | Section group headers | Violet / Dark blue |
| 7 | Column headers | Dark navy |
| 8+ | Data rows | Alternating white/light gray |

**Columns:** #, Main Category, Sub-category, Theme, Control Requirements, Test Procedures, Risk Narratives, [Framework columns...]

Framework columns show Section Numbers (or Topic if no section number exists) for each matching requirement.

---

## Processing Notes

- **Concurrency:** 3 parallel API calls to stay within rate limits
- **Rows without framework data:** Skipped (shown with empty AI columns)
- **Abort:** You can stop processing mid-way; already-generated rows are preserved
- **Re-run:** You can re-trigger generation at any time to regenerate content
