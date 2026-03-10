import { Loader2, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function ProcessingProgress({ status, completed, total, currentTheme, onAbort }) {
  if (status === 'idle') return null

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const isDone = status === 'done'
  const isError = status === 'error'

  return (
    <div className={`
      rounded-xl border p-4 transition-all
      ${isDone
        ? 'dark:bg-green-950/30 bg-green-50 dark:border-green-800/40 border-green-200'
        : isError
          ? 'dark:bg-red-950/30 bg-red-50 dark:border-red-800/40 border-red-200'
          : 'dark:bg-[#141820] bg-slate-50 dark:border-[#1f2535] border-slate-200'
      }
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isDone ? (
            <CheckCircle size={18} className="text-green-400 shrink-0" />
          ) : isError ? (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          ) : (
            <Loader2 size={18} className="text-violet-400 shrink-0 animate-spin" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold dark:text-slate-300 text-slate-600">
                {isDone
                  ? `✓ Processing complete — ${completed} themes generated`
                  : isError
                    ? 'Processing encountered errors'
                    : `Generating AI content — ${completed} / ${total} themes`
                }
              </span>
              <span className="text-xs font-mono dark:text-slate-400 text-slate-500 ml-3">
                {pct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full dark:bg-[#1b2030] bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                    : isError
                      ? 'bg-gradient-to-r from-red-500 to-red-400'
                      : 'bg-gradient-to-r from-violet-600 to-cyan-400'
                }`}
                style={{ width: `${isDone ? 100 : pct}%` }}
              />
            </div>

            {/* Current theme */}
            {!isDone && !isError && currentTheme && (
              <p className="text-xs dark:text-slate-500 text-slate-400 mt-1.5 truncate">
                Processing: <span className="dark:text-violet-300 text-violet-600 font-medium">{currentTheme}</span>
              </p>
            )}
          </div>
        </div>

        {!isDone && !isError && (
          <button
            onClick={onAbort}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium dark:text-red-400 text-red-500 dark:border-red-800/40 border-red-200 border dark:hover:bg-red-950/30 hover:bg-red-50 transition-colors"
          >
            <X size={12} className="inline mr-1" />
            Abort
          </button>
        )}
      </div>
    </div>
  )
}
