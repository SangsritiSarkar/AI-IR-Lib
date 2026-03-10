/**
 * Azure OpenAI API — generate Control Requirements, Test Procedures, Risk Narratives.
 * Concurrency: 3 parallel calls.
 */

const CONCURRENCY = 3

async function callAzure(config, messages) {
  const { endpoint, apiKey, deploymentName, apiVersion } = config
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 1500,
      temperature: 0.2,
    }),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText)
    throw new Error(`Azure ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

/**
 * Generate the three AI columns for one theme row.
 */
export async function generateAIContent(config, row) {
  if (!row.allRequirements || row.allRequirements.length === 0) {
    return { controlRequirements: '', testProcedures: '', riskNarratives: '' }
  }

  const reqText = row.allRequirements
    .map(r => `[${r.framework}]: ${r.text}`)
    .join('\n')

  const prompt = `You are a cybersecurity GRC (Governance, Risk, Compliance) expert.

The theme is: "${row.theme}"
Sub-category: "${row.subCategory}"
Main category: "${row.mainCategory}"

Below are the requirements for this theme from multiple cybersecurity frameworks:
---
${reqText}
---

Generate a JSON object with exactly these three keys:

"controlRequirements": A concise consolidated summary of all the above requirements. Write as numbered points separated by actual newlines (\n). Each point on its own line. Max 5 points. Be specific and actionable. Example format: "1. First point.\n2. Second point.\n3. Third point."

"testProcedures": Practical audit/testing procedures. Write as numbered questions starting with "Are..." or "Is...". Each on its own line separated by \n. Max 5 points. Example: "1. Are controls documented?\n2. Is access reviewed regularly?"

"riskNarratives": Business risks if controls are absent. Each on its own line separated by \n. Max 3 numbered points.

CRITICAL: Use actual newline characters (\n) between numbered points — NOT commas. Each numbered point must be on a separate line.
IMPORTANT: Respond with ONLY the raw JSON object. No markdown. No code fences. No explanation. Just the JSON.`

  const content = await callAzure(config, [
    {
      role: 'system',
      content: 'You are a cybersecurity GRC expert. You respond with valid raw JSON only — no markdown, no code fences.',
    },
    { role: 'user', content: prompt },
  ])

  // Parse JSON — strip any accidental markdown fences
  let parsed = null
  try {
    const clean = content
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim()
    parsed = JSON.parse(clean)
  } catch {
    // Attempt to extract each field with regex fallback
    const extract = (key) => {
      const m = content.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's'))
      return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : ''
    }
    parsed = {
      controlRequirements: extract('controlRequirements'),
      testProcedures:      extract('testProcedures'),
      riskNarratives:      extract('riskNarratives'),
    }
  }

  // Clean up: ensure numbered points are on new lines
  // Handles cases where AI returns "1. text,2. text" or "1. text 2. text"
  const fixNewlines = (text) => {
    if (!text) return 'Could not generate'
    return text
      .replace(/,\s*(\d+)\.\s+/g, '\n$1. ')   // "text,2. next" → "text\n2. next"
      .replace(/\.\s+(\d+)\.\s+/g, '.\n$1. ')  // "text. 2. next" → "text.\n2. next"
      .replace(/;\s*(\d+)\./g, '\n$1.')       // semicolon separated
      .trim()
  }

  return {
    controlRequirements: fixNewlines(parsed?.controlRequirements),
    testProcedures:      fixNewlines(parsed?.testProcedures),
    riskNarratives:      fixNewlines(parsed?.riskNarratives),
  }
}

/**
 * Process all rows with concurrency control.
 * Only processes rows that have _hasFrameworkData = true.
 *
 * @param {Object}   config       Azure credentials
 * @param {Array}    rows         All combined rows (mutable — AI results written back)
 * @param {Function} onProgress   (completed, total, currentTheme) => void
 * @param {Function} onRowDone    (rowIndex, aiResult) => void
 * @param {Object}   abortSignal  { aborted: boolean }
 */
export async function processAllRows(config, rows, onProgress, onRowDone, abortSignal) {
  const toProcess = rows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => row._hasFrameworkData)

  const total = toProcess.length
  let completed = 0

  const queue = [...toProcess]

  const worker = async () => {
    while (queue.length > 0 && !abortSignal.aborted) {
      const item = queue.shift()
      if (!item) continue
      const { row, idx } = item
      try {
        const result = await generateAIContent(config, row)
        onRowDone(idx, result)
      } catch (err) {
        console.error(`Row ${idx} error:`, err)
        onRowDone(idx, {
          controlRequirements: `Error: ${err.message}`,
          testProcedures:      '',
          riskNarratives:      '',
        })
      } finally {
        completed++
        onProgress(completed, total, row.theme)
      }
    }
  }

  // Run CONCURRENCY workers in parallel
  const workers = Array.from({ length: Math.min(CONCURRENCY, toProcess.length) }, worker)
  await Promise.all(workers)
}
