import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Sparkles, CheckCircle2, Circle, ChevronRight, RotateCcw, X, Bot, User } from 'lucide-react'

/**
 * FrameworkAdvisor — Chat panel that:
 * 1. User describes their industry / company type
 * 2. AI recommends which frameworks they need and why
 * 3. User can select/deselect recommended frameworks
 * 4. Parent receives selectedFrameworks → filters table + export
 */
export default function FrameworkAdvisor({ frameworks, config, onFrameworksSelected, onClose, showCloseAsNext = false }) {
  const [messages, setMessages]         = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your **Framework Advisor**.\n\nTell me about your organization — industry, size, geography, or any specific regulatory requirements — and I'll recommend which frameworks from your workbook are most relevant for you.\n\n*For example: "We are a fintech company handling payment card data, operating in the EU and US with around 500 employees."*`,
    }
  ])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [recommended, setRecommended]   = useState([])   // { name, reason, priority }
  const [selected, setSelected]         = useState([])   // framework names user checked
  const [confirmed, setConfirmed]       = useState(false)
  const bottomRef                       = useRef(null)
  const inputRef                        = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const systemPrompt = `You are a cybersecurity GRC expert advising an organization on which compliance frameworks they should adopt.

The available frameworks in their workbook are: ${frameworks.join(', ')}

Based on the user's description of their organization, recommend the most relevant frameworks.
Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "2-3 sentence explanation of the organization and its regulatory context",
  "recommendations": [
    { "name": "<exact framework name from the list>", "priority": "Essential|Recommended|Optional", "reason": "<one concise sentence why>" }
  ],
  "advice": "1-2 sentences of overall compliance strategy advice"
}

Rules:
- Only include frameworks that exist in the provided list (exact names)
- Priority: "Essential" = legally required or industry-standard, "Recommended" = strongly advisable, "Optional" = nice to have
- Order by priority then relevance
- Be specific and actionable`

      const { endpoint, apiKey, deploymentName, apiVersion } = config
      const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...newMessages.filter(m => m.role === 'user').map(m => ({ role: 'user', content: m.content })),
          ],
          max_tokens: 1000,
          temperature: 0.3,
        }),
      })

      if (!res.ok) throw new Error(`Azure ${res.status}`)
      const data  = await res.json()
      const raw   = data.choices?.[0]?.message?.content?.trim() || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      const recs = parsed.recommendations || []
      setRecommended(recs)
      setSelected(recs.filter(r => r.priority === 'Essential').map(r => r.name))

      const assistantMsg = `**Analysis complete!**\n\n${parsed.summary}\n\n${parsed.advice}\n\nI've identified **${recs.length} frameworks** below. Essential ones are pre-selected — toggle any you want to include or exclude, then click **Apply Selection**.`
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Sorry, I couldn't analyze that. ${err.message.includes('Azure') ? 'Check your Azure OpenAI configuration.' : 'Please try again.'}`
      }])
    } finally {
      setLoading(false)
    }
  }

  function toggleFramework(name) {
    setSelected(prev =>
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    )
    setConfirmed(false)
  }

  function selectAll()    { setSelected(frameworks); setConfirmed(false) }
  function selectNone()   { setSelected([]);          setConfirmed(false) }
  function resetAdvisor() {
    setMessages([{
      role: 'assistant',
      content: `👋 Hi! I'm your **Framework Advisor**.\n\nTell me about your organization — industry, size, geography, or any specific regulatory requirements — and I'll recommend which frameworks from your workbook are most relevant for you.\n\n*For example: "We are a fintech company handling payment card data, operating in the EU and US with around 500 employees."*`,
    }])
    setRecommended([])
    setSelected([])
    setConfirmed(false)
  }

  function applySelection() {
    onFrameworksSelected(selected.length > 0 ? selected : null)
    setConfirmed(true)
  }

  function showAll() {
    onFrameworksSelected(null)
    setConfirmed(false)
    setSelected([])
  }

  const priorityColor = {
    Essential:   'dark:text-red-400    text-red-600    dark:bg-red-950/30    bg-red-50    dark:border-red-800/40    border-red-200',
    Recommended: 'dark:text-amber-400  text-amber-600  dark:bg-amber-950/30  bg-amber-50  dark:border-amber-800/40  border-amber-200',
    Optional:    'dark:text-slate-400  text-slate-500  dark:bg-slate-800/30  bg-slate-100 dark:border-slate-700/40  border-slate-200',
  }

  return (
    <div className="flex flex-col h-full dark:bg-[#0a0e17] bg-white rounded-xl dark:border-[#1f2535] border-slate-200 border overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 dark:bg-[#0e1119] bg-slate-50 dark:border-[#1f2535] border-slate-200 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="text-xs font-semibold dark:text-slate-200 text-slate-700">Framework Advisor</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full dark:bg-violet-950/50 bg-violet-100 dark:text-violet-300 text-violet-600 dark:border-violet-800/30 border-violet-200 border">AI</span>
        </div>
        <div className="flex items-center gap-1">
          {recommended.length > 0 && (
            <button onClick={resetAdvisor} className="text-[10px] flex items-center gap-1 px-2 py-1 rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 transition-colors">
              <RotateCcw size={10} /> Reset
            </button>
          )}
          {showCloseAsNext ? (
            <button onClick={onClose} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:from-violet-500 hover:to-violet-400 transition-all">
              View Table <ChevronRight size={11} />
            </button>
          ) : (
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded dark:hover:bg-[#1f2535] hover:bg-slate-100 dark:text-slate-400 text-slate-500 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Chat column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-violet-600 to-cyan-500'
                    : 'dark:bg-[#1f2535] bg-slate-200'
                }`}>
                  {msg.role === 'assistant'
                    ? <Bot size={12} className="text-white" />
                    : <User size={11} className="dark:text-slate-300 text-slate-600" />
                  }
                </div>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'dark:bg-[#141820] bg-slate-100 dark:text-slate-200 text-slate-700 dark:border-[#2a3347] border-slate-200 border'
                    : 'bg-gradient-to-br from-violet-600 to-violet-500 text-white'
                }`}>
                  <MarkdownText text={msg.content} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="px-3 py-2.5 rounded-xl dark:bg-[#141820] bg-slate-100 dark:border-[#2a3347] border-slate-200 border">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 pb-4 shrink-0">
            <div className="flex gap-2 dark:bg-[#141820] bg-slate-100 rounded-xl dark:border-[#2a3347] border-slate-200 border p-1.5">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Describe your industry, company size, geography…"
                disabled={loading}
                className="flex-1 bg-transparent text-[12px] dark:text-slate-200 text-slate-700 dark:placeholder-slate-600 placeholder-slate-400 outline-none px-1"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-600 to-violet-500 text-white disabled:opacity-40 transition-opacity shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Framework selection panel — shows after AI responds */}
        {recommended.length > 0 && (
          <div className="w-56 shrink-0 flex flex-col dark:border-[#1f2535] border-slate-200 border-l overflow-hidden">
            <div className="px-3 py-2.5 dark:bg-[#0e1119] bg-slate-50 dark:border-[#1f2535] border-slate-200 border-b shrink-0">
              <p className="text-[10px] font-semibold dark:text-slate-300 text-slate-600">Framework Selection</p>
              <div className="flex gap-1.5 mt-1.5">
                <button onClick={selectAll}  className="text-[10px] px-1.5 py-0.5 rounded dark:bg-[#1f2535] bg-slate-200 dark:text-slate-400 text-slate-500 hover:dark:text-violet-300 hover:text-violet-600 transition-colors">All</button>
                <button onClick={selectNone} className="text-[10px] px-1.5 py-0.5 rounded dark:bg-[#1f2535] bg-slate-200 dark:text-slate-400 text-slate-500 hover:dark:text-violet-300 hover:text-violet-600 transition-colors">None</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {/* Recommended frameworks */}
              {recommended.map(rec => (
                <FrameworkCheckRow
                  key={rec.name}
                  name={rec.name}
                  priority={rec.priority}
                  reason={rec.reason}
                  checked={selected.includes(rec.name)}
                  priorityColor={priorityColor[rec.priority]}
                  onChange={() => toggleFramework(rec.name)}
                />
              ))}

              {/* Divider + remaining frameworks not in recommendations */}
              {(() => {
                const notRec = frameworks.filter(f => !recommended.find(r => r.name === f))
                if (!notRec.length) return null
                return (
                  <>
                    <div className="pt-1 pb-0.5">
                      <p className="text-[10px] dark:text-slate-600 text-slate-400 px-1 font-medium">Other frameworks</p>
                    </div>
                    {notRec.map(name => (
                      <FrameworkCheckRow
                        key={name}
                        name={name}
                        checked={selected.includes(name)}
                        onChange={() => toggleFramework(name)}
                      />
                    ))}
                  </>
                )
              })()}
            </div>

            <div className="px-2 pb-3 pt-2 space-y-1.5 shrink-0 dark:border-[#1f2535] border-slate-200 border-t">
              <button
                onClick={applySelection}
                disabled={selected.length === 0}
                className="w-full py-2 rounded-lg text-[11px] font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-500 disabled:opacity-40 hover:from-violet-500 hover:to-violet-400 transition-all flex items-center justify-center gap-1.5"
              >
                {confirmed ? <><CheckCircle2 size={11} /> Applied!</> : <><ChevronRight size={11} /> Apply ({selected.length})</>}
              </button>
              {confirmed && (
                <>
                  <button
                    onClick={onClose}
                    className="w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 dark:bg-cyan-900/30 bg-cyan-50 dark:border-cyan-800/30 border-cyan-200 border dark:text-cyan-300 text-cyan-700 hover:dark:bg-cyan-900/50 transition-colors"
                  >
                    View Table <ChevronRight size={11} />
                  </button>
                  <button
                    onClick={showAll}
                    className="w-full py-1.5 rounded-lg text-[10px] dark:text-slate-500 text-slate-400 dark:hover:text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    Show all frameworks
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FrameworkCheckRow({ name, priority, reason, checked, onChange, priorityColor }) {
  return (
    <button
      onClick={onChange}
      className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
        checked
          ? 'dark:bg-violet-950/30 bg-violet-50 dark:border-violet-800/30 border-violet-200 border'
          : 'dark:hover:bg-[#141820] hover:bg-slate-100 border border-transparent'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {checked
          ? <CheckCircle2 size={13} className="dark:text-violet-400 text-violet-600" />
          : <Circle       size={13} className="dark:text-slate-600 text-slate-300" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium dark:text-slate-200 text-slate-700 leading-tight truncate">{name}</p>
        {priority && (
          <span className={`text-[9px] px-1 py-0.5 rounded border font-medium inline-block mt-0.5 ${priorityColor}`}>
            {priority}
          </span>
        )}
        {reason && (
          <p className="text-[10px] dark:text-slate-500 text-slate-400 mt-0.5 leading-tight line-clamp-2">{reason}</p>
        )}
      </div>
    </button>
  )
}

// Simple markdown renderer for bold and italic
function MarkdownText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i}>{part.slice(1, -1)}</em>
        return part.split('\n').map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>{line}{j < part.split('\n').length - 1 && <br />}</React.Fragment>
        ))
      })}
    </>
  )
}
