import { useState, useCallback, useRef, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import {
  Settings, Moon, Sun, Download, Play, Shield,
  FileSpreadsheet, Layers, AlertCircle, Info
} from 'lucide-react'
import SettingsPanel from './components/SettingsPanel'
import FileUpload from './components/FileUpload'
import ProcessingProgress from './components/ProcessingProgress'
import OutputTable from './components/OutputTable'
import { parseThemeList, parseFrameworkWorkbook, buildCombinedRows } from './lib/excelParser'
import { processAllRows } from './lib/azureOpenAI'
import { exportToExcel } from './lib/excelExporter'

const DEFAULT_CONFIG = {
  endpoint: '',
  apiKey: '',
  deploymentName: 'gpt-4o',
  apiVersion: '2024-02-01',
}

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('azureConfig') || '{}') } catch { return {} }
  })
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  const [frameworkFile, setFrameworkFile] = useState(null)
  const [themeFile, setThemeFile] = useState(null)

  const [parsedData, setParsedData] = useState(null) // { rows, frameworks }
  const [isParsing, setIsParsing] = useState(false)

  const [processingStatus, setProcessingStatus] = useState('idle') // idle | running | done | error
  const [progressCompleted, setProgressCompleted] = useState(0)
  const [progressTotal, setProgressTotal] = useState(0)
  const [currentTheme, setCurrentTheme] = useState('')
  const abortRef = useRef({ aborted: false })

  // Persist dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleSaveConfig = (cfg) => {
    setConfig(cfg)
    localStorage.setItem('azureConfig', JSON.stringify(cfg))
    toast.success('Settings saved')
  }

  // Auto-parse when both files uploaded
  const handleFrameworkFile = useCallback(async (file) => {
    setFrameworkFile(file)
    if (!file) { setParsedData(null); return }
  }, [])

  const handleThemeFile = useCallback(async (file) => {
    setThemeFile(file)
    if (!file) { setParsedData(null); return }
  }, [])

  const handleParseFiles = async () => {
    if (!frameworkFile || !themeFile) {
      toast.error('Please upload both files first')
      return
    }
    setIsParsing(true)
    setParsedData(null)
    try {
      const [themeList, { frameworkMap, frameworks }] = await Promise.all([
        parseThemeList(themeFile),
        parseFrameworkWorkbook(frameworkFile),
      ])

      if (themeList.length === 0) {
        toast.error('Could not parse themes from ThemeList. Check file format.')
        return
      }
      if (frameworks.length === 0) {
        toast.error('No valid framework sheets found. Check column headers.')
        return
      }

      const rows = buildCombinedRows(themeList, frameworkMap, frameworks)

      // Diagnostic info for mismatch debugging
      const themeListSample = themeList.slice(0, 5).map(t => t.theme)
      const workbookThemeSample = [...frameworkMap.keys()].slice(0, 5)
      const matchCount = rows.filter(r => r._hasFrameworkData).length

      setParsedData({ rows, frameworks, themeListSample, workbookThemeSample, matchCount })
      setProcessingStatus('idle')
      toast.success(`Parsed ${themeList.length} themes across ${frameworks.length} frameworks`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsParsing(false)
    }
  }

  const handleGenerate = async () => {
    if (!parsedData) { toast.error('Parse files first'); return }
    if (!mergedConfig.endpoint || !mergedConfig.apiKey) {
      toast.error('Configure Azure OpenAI settings first')
      setSettingsOpen(true)
      return
    }

    abortRef.current = { aborted: false }
    setProcessingStatus('running')
    setProgressCompleted(0)

    const rowsToProcess = parsedData.rows.filter(r => r._hasFrameworkData)
    setProgressTotal(rowsToProcess.length)

    // Make a mutable copy
    const updatedRows = parsedData.rows.map(r => ({ ...r }))

    try {
      await processAllRows(
        mergedConfig,
        updatedRows,
        (completed, total, theme) => {
          setProgressCompleted(completed)
          setProgressTotal(total)
          setCurrentTheme(theme)
        },
        (idx, result) => {
          updatedRows[idx] = { ...updatedRows[idx], ...result }
          setParsedData(prev => {
            if (!prev) return prev
            const newRows = [...prev.rows]
            newRows[idx] = { ...newRows[idx], ...result }
            return { ...prev, rows: newRows }
          })
        },
        abortRef.current
      )
      if (!abortRef.current.aborted) {
        setProcessingStatus('done')
        toast.success('AI generation complete!')
      } else {
        setProcessingStatus('idle')
        toast('Processing aborted', { icon: '⚠️' })
      }
    } catch (err) {
      setProcessingStatus('error')
      toast.error('Processing error: ' + err.message)
    }
  }

  const handleAbort = () => {
    abortRef.current.aborted = true
  }

  const handleExport = () => {
    if (!parsedData) { toast.error('No data to export'); return }
    try {
      exportToExcel(parsedData.rows, parsedData.frameworks)
      toast.success('Excel file downloaded')
    } catch (err) {
      toast.error('Export failed: ' + err.message)
    }
  }

  const configOk = mergedConfig.endpoint && mergedConfig.apiKey && mergedConfig.deploymentName
  const filesReady = frameworkFile && themeFile
  const dataReady = !!parsedData
  const isProcessing = processingStatus === 'running'

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${dark ? 'dark' : ''}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: dark
            ? { background: '#141820', color: '#e2e8f0', border: '1px solid #2a3347', fontSize: '13px' }
            : { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', fontSize: '13px' },
        }}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={mergedConfig}
        onSave={handleSaveConfig}
      />

      {/* TOP BAR */}
      <header className="h-14 flex items-center justify-between px-6 dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border-b shrink-0 relative">
        {/* Gradient underline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold dark:text-white text-slate-800 leading-none">
              Unified Risk & Control Framework Builder
            </h1>
            <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-0.5">
              AI-powered cybersecurity framework consolidation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Config status indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
            configOk
              ? 'dark:bg-green-950/30 bg-green-50 dark:border-green-800/30 border-green-200 dark:text-green-400 text-green-600'
              : 'dark:bg-amber-950/30 bg-amber-50 dark:border-amber-800/30 border-amber-200 dark:text-amber-400 text-amber-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${configOk ? 'bg-green-400' : 'bg-amber-400'}`} />
            {configOk ? 'Azure connected' : 'Azure not configured'}
          </div>

          <button
            onClick={() => setDark(d => !d)}
            className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 transition-colors"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-300 text-slate-600 transition-colors border dark:border-[#2a3347] border-slate-200"
          >
            <Settings size={13} />
            Settings
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col dark:bg-[#07090f] bg-slate-50">

        {/* TOP PANEL — uploads + controls */}
        <div className="px-6 py-4 dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border-b shrink-0">
          <div className="flex flex-col gap-4">
            {/* Files + action row */}
            <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
              {/* File uploads */}
              <div className="flex-1 min-w-[300px]">
                <FileUpload
                  frameworkFile={frameworkFile}
                  themeFile={themeFile}
                  onFrameworkFile={handleFrameworkFile}
                  onThemeFile={handleThemeFile}
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
                <button
                  onClick={handleParseFiles}
                  disabled={!filesReady || isParsing || isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40
                    dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600
                    dark:hover:border-violet-500 hover:border-violet-400 dark:hover:text-violet-300 hover:text-violet-600"
                >
                  <Layers size={14} />
                  {isParsing ? 'Parsing…' : 'Parse Files'}
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={!dataReady || isProcessing || !configOk}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40
                    bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20
                    hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/30"
                >
                  <Play size={14} />
                  {isProcessing ? 'Generating…' : 'Generate AI Content'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={!dataReady}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40
                    bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20
                    hover:from-cyan-500 hover:to-cyan-400"
                >
                  <Download size={14} />
                  Download Excel
                </button>
              </div>
            </div>

            {/* Stats bar */}
            {dataReady && (
              <div className="flex items-center gap-4 flex-wrap">
                <Stat label="Themes" value={parsedData.rows.length} color="violet" />
                <Stat label="Frameworks" value={parsedData.frameworks.length} color="cyan" />
                <Stat
                  label="With Framework Data"
                  value={parsedData.rows.filter(r => r._hasFrameworkData).length}
                  color="green"
                />
                <Stat
                  label="AI Generated"
                  value={parsedData.rows.filter(r => r.controlRequirements && !String(r.controlRequirements).startsWith('Error')).length}
                  color="amber"
                />
                {/* Framework names */}
                <div className="flex items-center gap-1 flex-wrap ml-auto">
                  {parsedData.frameworks.map(fw => (
                    <span key={fw} className="text-[10px] px-2 py-0.5 rounded-full dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border dark:text-slate-400 text-slate-500">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parse debug panel */}
            {dataReady && (
              <details className="text-xs dark:text-slate-500 text-slate-400 cursor-pointer" open={parsedData.matchCount === 0}>
                <summary className="hover:dark:text-slate-300 hover:text-slate-600 transition-colors select-none font-semibold">
                  {parsedData.matchCount === 0 ? '🔴' : '🟡'} Parse debug — {parsedData.matchCount === 0 ? 'THEME MISMATCH DETECTED — click to diagnose' : 'click to inspect'}
                </summary>
                <div className="mt-2 p-3 rounded-lg dark:bg-[#07090f] bg-slate-100 dark:border-[#1f2535] border-slate-200 border font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="dark:text-green-400 text-green-600 font-bold mb-1">✅ ThemeList themes (sample):</p>
                      {parsedData.themeListSample?.map((t, i) => (
                        <p key={i} className="dark:text-slate-300 text-slate-600 truncate">"{t}"</p>
                      ))}
                    </div>
                    <div>
                      <p className="dark:text-cyan-400 text-cyan-600 font-bold mb-1">📋 Workbook Theme column values (sample):</p>
                      {parsedData.workbookThemeSample?.map((t, i) => (
                        <p key={i} className="dark:text-slate-300 text-slate-600 truncate">"{t}"</p>
                      ))}
                    </div>
                  </div>
                  {parsedData.matchCount === 0 && (
                    <div className="mt-2 p-2 rounded dark:bg-red-950/30 bg-red-50 dark:border-red-800/30 border-red-200 border dark:text-red-300 text-red-600">
                      ⚠️ The Theme values in the two files don't match. The ThemeList has numbered themes like "1.1.1. Management Reporting" but the workbook Theme column likely has different text like "IT Governance Framework". These must match exactly for mapping to work.
                    </div>
                  )}
                  <p className="dark:text-slate-500 text-slate-400">Frameworks detected: {parsedData.frameworks.join(', ')}</p>
                  <p className="dark:text-slate-500 text-slate-400">Themes matched: {parsedData.matchCount} / {parsedData.rows.length}</p>
                </div>
              </details>
            )}

            {/* Progress */}
            {processingStatus !== 'idle' && (
              <ProcessingProgress
                status={processingStatus}
                completed={progressCompleted}
                total={progressTotal}
                currentTheme={currentTheme}
                onAbort={handleAbort}
              />
            )}
          </div>
        </div>

        {/* TABLE AREA */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          {!dataReady ? (
            <EmptyState hasFiles={filesReady} />
          ) : (
            <OutputTable rows={parsedData.rows} frameworks={parsedData.frameworks} />
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({ label, value, color }) {
  const colors = {
    violet: 'dark:text-violet-300 text-violet-700 dark:bg-violet-950/40 bg-violet-50 dark:border-violet-800/30 border-violet-200',
    cyan: 'dark:text-cyan-300 text-cyan-700 dark:bg-cyan-950/40 bg-cyan-50 dark:border-cyan-800/30 border-cyan-200',
    green: 'dark:text-green-300 text-green-700 dark:bg-green-950/40 bg-green-50 dark:border-green-800/30 border-green-200',
    amber: 'dark:text-amber-300 text-amber-700 dark:bg-amber-950/40 bg-amber-50 dark:border-amber-800/30 border-amber-200',
  }
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${colors[color]}`}>
      <span className="font-bold">{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  )
}

function EmptyState({ hasFiles }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border dark:border-violet-800/30 border-violet-200 flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet size={28} className="dark:text-violet-400 text-violet-500" />
        </div>
        <h3 className="text-sm font-semibold dark:text-slate-300 text-slate-600 mb-2">
          {hasFiles ? 'Ready to Parse' : 'Upload Your Files'}
        </h3>
        <p className="text-xs dark:text-slate-500 text-slate-400 leading-relaxed">
          {hasFiles
            ? 'Both files uploaded. Click "Parse Files" to extract and map the framework data to themes.'
            : 'Upload the Framework Workbook (multi-sheet Excel with frameworks) and the ThemeList Excel to get started.'
          }
        </p>
        {!hasFiles && (
          <div className="mt-4 flex flex-col gap-2 text-left dark:bg-[#0e1119] bg-white rounded-xl dark:border-[#1f2535] border-slate-200 border p-4">
            <div className="flex items-start gap-2">
              <Info size={12} className="dark:text-violet-400 text-violet-500 mt-0.5 shrink-0" />
              <p className="text-[11px] dark:text-slate-400 text-slate-500">
                <strong className="dark:text-slate-300 text-slate-600">Framework Workbook:</strong> Multi-sheet Excel. Each sheet = one framework with columns: Source Name, Topic, Sub Topic, Section Number, Requirements, Theme
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info size={12} className="dark:text-cyan-400 text-cyan-500 mt-0.5 shrink-0" />
              <p className="text-[11px] dark:text-slate-400 text-slate-500">
                <strong className="dark:text-slate-300 text-slate-600">ThemeList:</strong> Excel with hierarchical structure — Main Category → Sub-category → Theme (numbered format like 01., 1.1., 1.1.1.)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
