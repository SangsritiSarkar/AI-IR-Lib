import { useRef } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, X } from 'lucide-react'

function UploadZone({ label, hint, file, onFile, onClear, accent = 'violet' }) {
  const inputRef = useRef()

  const accentMap = {
    violet: {
      ring: 'focus-within:border-violet-500',
      bg: 'hover:bg-violet-500/5',
      icon: 'text-violet-400',
      badge: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
      dot: 'bg-violet-500',
    },
    cyan: {
      ring: 'focus-within:border-cyan-500',
      bg: 'hover:bg-cyan-500/5',
      icon: 'text-cyan-400',
      badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      dot: 'bg-cyan-500',
    },
  }
  const a = accentMap[accent]

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all cursor-pointer
        ${file
          ? 'border-green-500/40 bg-green-500/5 dark:bg-green-500/5'
          : `border-dashed dark:border-[#2a3347] border-slate-200 ${a.bg} dark:${a.bg}`
        }
      `}
      onClick={() => !file && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />

      <div className="p-5">
        {file ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-semibold dark:text-slate-300 text-slate-600 mb-0.5">{label}</p>
                <p className="text-xs dark:text-green-400 text-green-600 font-medium truncate max-w-[180px]">{file.name}</p>
                <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onClear() }}
              className="w-6 h-6 rounded flex items-center justify-center dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors shrink-0"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl dark:bg-[#1b2030] bg-slate-100 flex items-center justify-center ${a.icon}`}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold dark:text-slate-300 text-slate-600">{label}</p>
              <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">{hint}</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${a.badge}`}>
              <Upload size={11} />
              Drop or click to upload
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FileUpload({ frameworkFile, themeFile, onFrameworkFile, onThemeFile }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UploadZone
        label="Framework Workbook"
        hint="Multi-sheet Excel with frameworks"
        file={frameworkFile}
        onFile={onFrameworkFile}
        onClear={() => onFrameworkFile(null)}
        accent="violet"
      />
      <UploadZone
        label="ThemeList"
        hint="Excel with categories & themes"
        file={themeFile}
        onFile={onThemeFile}
        onClear={() => onThemeFile(null)}
        accent="cyan"
      />
    </div>
  )
}
