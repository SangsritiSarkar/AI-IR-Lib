import { useState, useCallback, useRef, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import {
  Settings, Moon, Sun, Download, Play, Shield,
  FileSpreadsheet, Info, CheckCircle2, ChevronRight,
  Sparkles, BarChart3, Loader2
} from 'lucide-react'
import SettingsPanel from './components/SettingsPanel'
import FileUpload from './components/FileUpload'
import ProcessingProgress from './components/ProcessingProgress'
import OutputTable from './components/OutputTable'
import FrameworkAdvisor from './components/FrameworkAdvisor'
import { parseThemeList, parseFrameworkWorkbook, buildCombinedRows } from './lib/excelParser'
import { processAllRows } from './lib/azureOpenAI'
import { exportToExcel } from './lib/excelExporter'

// ── Wizard steps ────────────────────────────────────────────────────────────
// 1: upload    — upload both files (auto-parse in background on both uploaded)
// 2: advisor   — chat with AI advisor, select frameworks
// 3: table     — see filtered table, generate AI content, export
const STEPS = ['upload', 'advisor', 'table']

const DEFAULT_CONFIG = {
  endpoint: '', apiKey: '', deploymentName: 'gpt-4o', apiVersion: '2024-02-01',
}

export default function App() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('azureConfig') || '{}') } catch { return {} }
  })
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // ── Files ─────────────────────────────────────────────────────────────────
  const [frameworkFile, setFrameworkFile] = useState(null)
  const [themeFile,     setThemeFile]     = useState(null)
  const [isParsing,     setIsParsing]     = useState(false)
  const [parsedData,    setParsedData]    = useState(null)

  // ── Wizard step ───────────────────────────────────────────────────────────
  const [step, setStep] = useState('upload')  // 'upload' | 'advisor' | 'table'

  // ── Framework filter (from advisor) ──────────────────────────────────────
  const [activeFrameworks, setActiveFrameworks] = useState(null) // null = all

  // ── AI generation ─────────────────────────────────────────────────────────
  const [processingStatus,   setProcessingStatus]   = useState('idle')
  const [progressCompleted,  setProgressCompleted]  = useState(0)
  const [progressTotal,      setProgressTotal]       = useState(0)
  const [currentTheme,       setCurrentTheme]        = useState('')
  const abortRef = useRef({ aborted: false })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleSaveConfig = (cfg) => {
    setConfig(cfg)
    localStorage.setItem('azureConfig', JSON.stringify(cfg))
    toast.success('Settings saved')
  }

  // ── Auto-parse when both files are uploaded ───────────────────────────────
  const parseFiles = useCallback(async (fwFile, thFile) => {
    if (!fwFile || !thFile) return
    setIsParsing(true)
    setParsedData(null)
    try {
      const [themeList, { frameworkMap, frameworks }] = await Promise.all([
        parseThemeList(thFile),
        parseFrameworkWorkbook(fwFile),
      ])
      if (themeList.length === 0) { toast.error('Could not parse ThemeList'); return }
      if (frameworks.length === 0) { toast.error('No framework sheets found'); return }
      const rows       = buildCombinedRows(themeList, frameworkMap, frameworks)
      const matchCount = rows.filter(r => r._hasFrameworkData).length
      setParsedData({
        rows, frameworks,
        themeListSample:    themeList.slice(0, 5).map(t => t.theme),
        workbookThemeSample:[...frameworkMap.keys()].slice(0, 5),
        matchCount,
      })
      setProcessingStatus('idle')
      toast.success(`Parsed ${themeList.length} themes across ${frameworks.length} frameworks`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const handleFrameworkFile = useCallback((file) => {
    setFrameworkFile(file)
    setParsedData(null)
    setStep('upload')
    if (file && themeFile) parseFiles(file, themeFile)
  }, [themeFile, parseFiles])

  const handleThemeFile = useCallback((file) => {
    setThemeFile(file)
    setParsedData(null)
    setStep('upload')
    if (file && frameworkFile) parseFiles(frameworkFile, file)
  }, [frameworkFile, parseFiles])

  // ── Generate AI content ────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!parsedData) return
    if (!mergedConfig.endpoint || !mergedConfig.apiKey) {
      toast.error('Configure Azure OpenAI first')
      setSettingsOpen(true)
      return
    }
    abortRef.current = { aborted: false }
    setProcessingStatus('running')
    setProgressCompleted(0)
    // Only process rows visible in current filtered view that have framework data
    const rowsToProcess = visibleRows.filter(r => r._hasFrameworkData)
    setProgressTotal(rowsToProcess.length)
    const updatedRows = parsedData.rows.map(r => ({ ...r }))
    try {
      await processAllRows(
        mergedConfig, updatedRows,
        (completed, total, theme) => {
          setProgressCompleted(completed); setProgressTotal(total); setCurrentTheme(theme)
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
        toast('Aborted', { icon: '⚠️' })
      }
    } catch (err) {
      setProcessingStatus('error')
      toast.error('Error: ' + err.message)
    }
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = (fwOverride) => {
    if (!parsedData) return
    try {
      const fwToExport  = fwOverride || activeFrameworks || parsedData.frameworks
      // When exporting with a filter, only include rows that have data for the selected frameworks
      const sourceRows = (fwOverride === parsedData.frameworks)
        ? parsedData.rows  // "Export all" uses all rows
        : visibleRows      // filtered export uses visible rows only
      const rowsToExport = sourceRows.map(row => ({
        ...row,
        frameworkSections: Object.fromEntries(
          Object.entries(row.frameworkSections || {}).filter(([k]) => fwToExport.includes(k))
        ),
      }))
      exportToExcel(rowsToExport, fwToExport)
      toast.success('Excel downloaded')
    } catch (err) {
      toast.error('Export failed: ' + err.message)
    }
  }

  const configOk     = !!(mergedConfig.endpoint && mergedConfig.apiKey && mergedConfig.deploymentName)
  const filesReady   = !!(frameworkFile && themeFile)
  const dataReady    = !!parsedData
  const isProcessing = processingStatus === 'running'
  const aiDone       = parsedData?.rows.filter(r => r.controlRequirements && !String(r.controlRequirements).startsWith('Error')).length > 0

  // When frameworks are filtered via Advisor, only show rows that have data for at least one selected framework
  const visibleRows = !parsedData ? [] : (
    activeFrameworks
      ? parsedData.rows.filter(row =>
          activeFrameworks.some(fw => row.frameworkSections?.[fw]?.trim())
        )
      : parsedData.rows
  )

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
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} config={mergedConfig} onSave={handleSaveConfig} />

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border-b shrink-0 relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold dark:text-white text-slate-800 leading-none">Unified Risk & Control Framework Builder</h1>
            <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-0.5">AI-powered cybersecurity framework consolidation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
            configOk
              ? 'dark:bg-green-950/30 bg-green-50 dark:border-green-800/30 border-green-200 dark:text-green-400 text-green-600'
              : 'dark:bg-amber-950/30 bg-amber-50 dark:border-amber-800/30 border-amber-200 dark:text-amber-400 text-amber-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${configOk ? 'bg-green-400' : 'bg-amber-400'}`} />
            {configOk ? 'Azure connected' : 'Azure not configured'}
          </div>
          <button onClick={() => setDark(d => !d)} className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 transition-colors">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setSettingsOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-300 text-slate-600 transition-colors border dark:border-[#2a3347] border-slate-200">
            <Settings size={13} /> Settings
          </button>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden flex flex-col dark:bg-[#07090f] bg-slate-50">

        {/* ── STEP INDICATOR ────────────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-3 dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border-b flex items-center gap-0">
          <StepPill n={1} label="Upload & Parse" active={step === 'upload'} done={dataReady} onClick={() => setStep('upload')} />
          <StepArrow />
          <StepPill n={2} label="Framework Advisor" active={step === 'advisor'} done={step === 'table' && !!activeFrameworks} disabled={!dataReady} onClick={() => dataReady && setStep('advisor')} />
          <StepArrow />
          <StepPill n={3} label="Table, Generate & Export" active={step === 'table'} done={aiDone} disabled={!dataReady} onClick={() => dataReady && setStep('table')} />
        </div>

        {/* ── STEP 1: UPLOAD ────────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8">

              {/* Header */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border dark:border-violet-800/30 border-violet-200 flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet size={26} className="dark:text-violet-400 text-violet-500" />
                </div>
                <h2 className="text-base font-bold dark:text-white text-slate-800">Upload Your Files</h2>
                <p className="text-xs dark:text-slate-400 text-slate-500 mt-1">Upload both files — parsing happens automatically</p>
              </div>

              {/* File uploads */}
              <FileUpload
                frameworkFile={frameworkFile}
                themeFile={themeFile}
                onFrameworkFile={handleFrameworkFile}
                onThemeFile={handleThemeFile}
              />

              {/* Parsing status */}
              {filesReady && (
                <div className={`rounded-xl p-4 border flex items-center gap-3 ${
                  isParsing
                    ? 'dark:bg-amber-950/20 bg-amber-50 dark:border-amber-800/30 border-amber-200'
                    : dataReady
                      ? 'dark:bg-green-950/20 bg-green-50 dark:border-green-800/30 border-green-200'
                      : 'dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200'
                }`}>
                  {isParsing ? (
                    <><Loader2 size={16} className="dark:text-amber-400 text-amber-500 animate-spin shrink-0" />
                    <p className="text-xs dark:text-amber-300 text-amber-700 font-medium">Parsing files…</p></>
                  ) : dataReady ? (
                    <><CheckCircle2 size={16} className="dark:text-green-400 text-green-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs dark:text-green-300 text-green-700 font-medium">
                        Parsed successfully — {parsedData.rows.length} themes · {parsedData.frameworks.length} frameworks · {parsedData.matchCount} matched
                      </p>
                    </div></> 
                  ) : null}
                </div>
              )}

              {/* File format hints */}
              {!filesReady && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={12} className="dark:text-violet-400 text-violet-500 shrink-0" />
                      <p className="text-[11px] font-semibold dark:text-slate-300 text-slate-600">Framework Workbook</p>
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-relaxed">Multi-sheet Excel. Each sheet = one framework with columns: Source Name, Topic, Sub Topic, Section Number, Requirements, Theme</p>
                  </div>
                  <div className="p-4 rounded-xl dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={12} className="dark:text-cyan-400 text-cyan-500 shrink-0" />
                      <p className="text-[11px] font-semibold dark:text-slate-300 text-slate-600">ThemeList</p>
                    </div>
                    <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-relaxed">Excel with hierarchical structure — Main Category → Sub-category → Theme (numbered like 01., 1.1., 1.1.1.)</p>
                  </div>
                </div>
              )}

              {/* CTA */}
              {dataReady && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setStep('advisor')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-violet-400 transition-all"
                  >
                    <Sparkles size={15} />
                    Continue to Framework Advisor
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: ADVISOR ───────────────────────────────────────────── */}
        {step === 'advisor' && dataReady && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="shrink-0 px-6 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold dark:text-white text-slate-800">Framework Advisor</h2>
                <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">Describe your organization — AI will recommend which frameworks apply to you</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep('table')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600 dark:hover:text-white hover:text-slate-900 transition-colors"
                >
                  Skip — use all frameworks
                </button>
                {activeFrameworks && (
                  <button
                    onClick={() => setStep('table')}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/20 hover:from-violet-500 hover:to-violet-400 transition-all"
                  >
                    View Table ({activeFrameworks.length} frameworks) <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-hidden px-6 pb-4">
              <FrameworkAdvisor
                frameworks={parsedData.frameworks}
                config={mergedConfig}
                onFrameworksSelected={(fws) => {
                  setActiveFrameworks(fws)
                  if (fws) toast.success(`${fws.length} frameworks selected`)
                }}
                onClose={() => setStep('table')}
                showCloseAsNext={true}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: TABLE + GENERATE + EXPORT ─────────────────────────── */}
        {step === 'table' && dataReady && (
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Controls bar */}
            <div className="shrink-0 px-6 py-3 dark:bg-[#0e1119] bg-white dark:border-[#1f2535] border-slate-200 border-b flex items-center gap-3 flex-wrap">

              {/* Stats */}
              <Stat label="Themes"    value={visibleRows.length + (activeFrameworks && visibleRows.length < parsedData.rows.length ? ` / ${parsedData.rows.length}` : '')}  color="violet" />
              <Stat label="Frameworks" value={(activeFrameworks || parsedData.frameworks).length}                 color="cyan"   />
              <Stat label="Matched"   value={parsedData.matchCount}                                              color="green"  />
              <Stat label="AI Done"   value={parsedData.rows.filter(r => r.controlRequirements && !String(r.controlRequirements).startsWith('Error')).length} color="amber" />

              {/* Framework filter badge */}
              {activeFrameworks && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg dark:bg-violet-950/40 bg-violet-50 dark:border-violet-800/30 border-violet-200 border text-[10px] dark:text-violet-300 text-violet-700">
                  <Sparkles size={10} />
                  <span className="font-semibold">{activeFrameworks.length} frameworks</span>
                  <span className="opacity-60">from advisor</span>
                  <button onClick={() => setActiveFrameworks(null)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">✕</button>
                </div>
              )}

              {/* Right: actions */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setStep('advisor')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600 dark:hover:border-violet-500 hover:border-violet-400 dark:hover:text-violet-300 hover:text-violet-600 transition-all"
                >
                  <Sparkles size={12} /> Advisor
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={isProcessing || !configOk}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/20 disabled:opacity-40 hover:from-violet-500 hover:to-violet-400 transition-all"
                >
                  {isProcessing ? <><Loader2 size={12} className="animate-spin" /> Generating…</> : <><Play size={12} /> Generate AI Content</>}
                </button>

                <button
                  onClick={() => handleExport()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 transition-all"
                >
                  <Download size={12} />
                  {activeFrameworks ? `Export (${activeFrameworks.length} FW)` : 'Download Excel'}
                </button>

                {activeFrameworks && (
                  <button
                    onClick={() => handleExport(parsedData.frameworks)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border dark:text-slate-300 text-slate-600 hover:dark:text-white hover:text-slate-900 transition-colors"
                  >
                    <Download size={12} /> Export all
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {processingStatus !== 'idle' && (
              <div className="shrink-0 px-6 pt-2">
                <ProcessingProgress
                  status={processingStatus}
                  completed={progressCompleted}
                  total={progressTotal}
                  currentTheme={currentTheme}
                  onAbort={() => { abortRef.current.aborted = true }}
                />
              </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-hidden px-6 py-3">
              <OutputTable
                rows={visibleRows}
                frameworks={activeFrameworks || parsedData.frameworks}
                allFrameworks={parsedData.frameworks}
              />
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

// ── Step pill ──────────────────────────────────────────────────────────────
function StepPill({ n, label, active, done, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'dark:bg-violet-950/50 bg-violet-50 dark:border-violet-700 border-violet-300 border dark:text-violet-200 text-violet-800'
          : done
            ? 'dark:text-green-400 text-green-600 dark:hover:bg-[#0e1119] hover:bg-slate-100 transition-colors'
            : 'dark:text-slate-400 text-slate-500 dark:hover:bg-[#0e1119] hover:bg-slate-100 transition-colors'
      }`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        active ? 'bg-violet-500 text-white'
        : done  ? 'bg-green-500 text-white'
        : 'dark:bg-[#1f2535] bg-slate-200 dark:text-slate-400 text-slate-500'
      }`}>
        {done && !active ? '✓' : n}
      </span>
      {label}
    </button>
  )
}

function StepArrow() {
  return <ChevronRight size={14} className="dark:text-slate-700 text-slate-300 shrink-0 mx-1" />
}

// ── Stat pill ──────────────────────────────────────────────────────────────
function Stat({ label, value, color }) {
  const colors = {
    violet: 'dark:text-violet-300 text-violet-700 dark:bg-violet-950/40 bg-violet-50 dark:border-violet-800/30 border-violet-200',
    cyan:   'dark:text-cyan-300 text-cyan-700 dark:bg-cyan-950/40 bg-cyan-50 dark:border-cyan-800/30 border-cyan-200',
    green:  'dark:text-green-300 text-green-700 dark:bg-green-950/40 bg-green-50 dark:border-green-800/30 border-green-200',
    amber:  'dark:text-amber-300 text-amber-700 dark:bg-amber-950/40 bg-amber-50 dark:border-amber-800/30 border-amber-200',
  }
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${colors[color]}`}>
      <span className="font-bold">{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  )
}
