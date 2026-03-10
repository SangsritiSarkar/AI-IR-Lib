import { useState } from 'react'
import { X, Eye, EyeOff, Settings, CheckCircle } from 'lucide-react'

export default function SettingsPanel({ isOpen, onClose, config, onSave }) {
  const [form, setForm] = useState(config)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setTestResult(null)
  }

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const { endpoint, apiKey, deploymentName, apiVersion } = form
      const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Say "OK" only.' }],
          max_tokens: 5,
        }),
      })
      if (res.ok) setTestResult({ ok: true, msg: 'Connection successful!' })
      else {
        const t = await res.text()
        setTestResult({ ok: false, msg: `Error ${res.status}: ${t.slice(0, 100)}` })
      }
    } catch (e) {
      setTestResult({ ok: false, msg: e.message })
    } finally {
      setTesting(false)
    }
  }

  const inputClass = (dark) =>
    `w-full px-3 py-2 rounded-lg border text-sm font-mono transition-colors outline-none focus:ring-2 ` +
    (dark
      ? 'bg-[#07090f] border-[#2a3347] text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:ring-violet-500/20'
      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-violet-400/20')

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg dark:bg-[#0e1119] bg-white rounded-2xl border dark:border-[#2a3347] border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-[#1f2535] border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center">
              <Settings size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold dark:text-white text-slate-800">Azure OpenAI Settings</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">Configure your GPT-4o credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wide">
              Azure Endpoint
            </label>
            <input
              type="url"
              className={inputClass(true)}
              placeholder="https://your-resource.openai.azure.com"
              value={form.endpoint}
              onChange={e => handleChange('endpoint', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wide">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className={inputClass(true) + ' pr-10'}
                placeholder="••••••••••••••••••••••••••••••••"
                value={form.apiKey}
                onChange={e => handleChange('apiKey', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-slate-500 text-slate-400 hover:text-violet-500 transition-colors"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wide">
                Deployment Name
              </label>
              <input
                type="text"
                className={inputClass(true)}
                placeholder="gpt-4o"
                value={form.deploymentName}
                onChange={e => handleChange('deploymentName', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wide">
                API Version
              </label>
              <input
                type="text"
                className={inputClass(true)}
                placeholder="2024-02-01"
                value={form.apiVersion}
                onChange={e => handleChange('apiVersion', e.target.value)}
              />
            </div>
          </div>

          {/* Test result */}
          {testResult && (
            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
              testResult.ok
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {testResult.ok && <CheckCircle size={14} className="shrink-0 mt-0.5" />}
              {testResult.msg}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t dark:border-[#1f2535] border-slate-100">
          <button
            onClick={handleTest}
            disabled={testing || !form.endpoint || !form.apiKey}
            className="px-4 py-2 rounded-lg text-xs font-medium border dark:border-[#2a3347] border-slate-200 dark:text-slate-300 text-slate-600 dark:hover:border-cyan-500 hover:border-cyan-400 dark:hover:text-cyan-400 hover:text-cyan-600 transition-colors disabled:opacity-40"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium dark:text-slate-400 text-slate-500 dark:hover:text-slate-200 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!form.endpoint || !form.apiKey || !form.deploymentName}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white disabled:opacity-40 hover:from-violet-500 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/20"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
