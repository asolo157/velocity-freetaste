import { useState, useRef } from 'react'
import './index.css'

const STATUSES = [
  'Analyzing job description...',
  'Mapping required competencies...',
  'Building sourcing strategy...',
  'Generating boolean search strings...',
  'Structuring interview framework...',
  'Writing tiered questions...',
  'Building scoring rubric...',
  'Finalizing deliverable package...',
]

export default function App() {
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('memo')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const statusInterval = useRef(null)

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  async function generate() {
    if (!jd.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setStatusIdx(0)

    statusInterval.current = setInterval(() => {
      setStatusIdx(i => Math.min(i + 1, STATUSES.length - 1))
    }, 2200)

    try {
      // Calls our secure serverless function — API key never leaves the server
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, company, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server returned ${res.status}`)
      }

      setResult(data)
      setActiveTab('memo')
    } catch (e) {
      setError('Something went wrong: ' + e.message)
    } finally {
      clearInterval(statusInterval.current)
      setLoading(false)
    }
  }

  function copyText(content, key) {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  function getMemoText() {
    if (!result) return ''
    const m = result.memo
    const g = result.guide
    return `SOURCING STRATEGY MEMO
Role: ${result.role} | ${result.company}
Prepared by: Velocity Talent | AI-Driven Technical Recruiting
Date: ${today}

ROLE OVERVIEW
${m.overview}

IDEAL CANDIDATE PROFILE
${m.ideal_profile.map(i => `• ${i}`).join('\n')}

SOURCING STRATEGIES
${m.sourcing_strategies.map((s, i) => `${i + 1}. ${s.channel}\n   ${s.approach}`).join('\n\n')}

BOOLEAN SEARCH STRINGS
${m.boolean_strings.map(b => `${b.platform}:\n${b.string}`).join('\n\n')}

MARKET NOTES
${m.market_notes}

ESTIMATED TIMELINE: ${m.time_estimate}

---
INTERVIEW GUIDE SUMMARY
Categories: ${g.categories.join(', ')}

Screening Questions:
${g.screening_questions.map((q, i) => `${i + 1}. ${q.question}\n   Probe: ${q.probe}`).join('\n\n')}

Intermediate Questions:
${g.intermediate_questions.map((q, i) => `${i + 1}. ${q.question}\n   Probe: ${q.probe}`).join('\n\n')}

Expert Questions:
${g.expert_questions.map((q, i) => `${i + 1}. ${q.question}\n   Probe: ${q.probe}`).join('\n\n')}

Red Flags: ${g.red_flags.join(' | ')}
Green Lights: ${g.green_lights.join(' | ')}`
  }

  function exportPDF(tab) {
    if (!result) return
    const m = result.memo
    const g = result.guide
    const isMemo = tab === 'memo'

    const printCSS = `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=DM+Mono:wght@400&family=Lato:wght@400;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Lato', sans-serif; font-size: 13px; line-height: 1.65; color: #1a1a1a; background: white; }
      .doc { max-width: 760px; margin: 0 auto; padding: 40px 48px; }
      .top-bar { height: 5px; background: linear-gradient(90deg, #1A3A5C, #c8441b); margin-bottom: 28px; }
      .guide-bar { background: linear-gradient(90deg, #c8441b, #1A3A5C); }
      .logo-line { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #c8441b; display: flex; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid #d8d0c0; margin-bottom: 24px; }
      .title-block { margin-bottom: 24px; }
      h2 { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; color: #1A3A5C; margin-bottom: 4px; }
      .role-sub, .guide-sub { font-size: 12px; color: #888; font-style: italic; }
      .cats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
      .cat { background: #EEF4FB; color: #1A3A5C; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 8px; border: 1px solid #C8D8EA; }
      .meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #d8d0c0; border: 1px solid #d8d0c0; margin-bottom: 24px; }
      .meta-cell { background: #f9f5ee; padding: 10px 14px; }
      .meta-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: #c8441b; display: block; margin-bottom: 3px; }
      .meta-val { color: #1A3A5C; font-weight: 700; font-size: 12px; }
      .section { margin-bottom: 22px; }
      h3 { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #1A3A5C; padding-bottom: 5px; border-bottom: 1px solid #d8d0c0; margin-bottom: 10px; }
      p { font-size: 12.5px; color: #2a2a2a; line-height: 1.65; }
      ul { list-style: none; }
      ul li { font-size: 12.5px; color: #2a2a2a; padding: 5px 0 5px 16px; border-bottom: 1px solid #ede8df; position: relative; line-height: 1.5; }
      ul li:last-child { border-bottom: none; }
      ul li::before { content: '→'; position: absolute; left: 0; color: #c8441b; font-size: 10px; }
      ul li strong { color: #1A3A5C; }
      .bool-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; color: #1A3A5C; margin: 10px 0 4px; }
      .bool-block { background: #1a1a2e; color: #a8d8a8; font-family: 'DM Mono', monospace; font-size: 10px; line-height: 1.7; padding: 10px 14px; border-left: 3px solid #c8441b; white-space: pre-wrap; word-break: break-all; margin-bottom: 8px; }
      .tier-head { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding: 4px 10px; display: inline-block; margin: 14px 0 10px; }
      .screening { background: #e8f4e8; color: #2a6a2a; }
      .intermediate { background: #fff3e0; color: #a85400; }
      .expert { background: #fce8e8; color: #9a2020; }
      .q-card { background: white; border: 1px solid #e0d8cc; border-left: 3px solid #1A3A5C; padding: 10px 14px; margin-bottom: 7px; page-break-inside: avoid; }
      .q-mid { border-left-color: #a85400; }
      .q-exp { border-left-color: #9a2020; }
      .q-text { font-size: 12.5px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; line-height: 1.45; }
      .q-probe { font-size: 11px; color: #888; font-style: italic; }
      .signals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
      .sig-col h4 { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; padding-bottom: 5px; border-bottom: 2px solid; margin-bottom: 8px; }
      .sig-col.red h4 { color: #9a2020; border-color: #9a2020; }
      .sig-col.green h4 { color: #2a6a2a; border-color: #2a6a2a; }
      .sig-item { font-size: 12px; padding: 4px 0; border-bottom: 1px solid #ede8df; color: #333; }
      .sig-item:last-child { border-bottom: none; }
      .rubric-head { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #1A3A5C; padding-bottom: 5px; border-bottom: 1px solid #d8d0c0; margin: 20px 0 8px; }
      .rubric { width: 100%; border-collapse: collapse; font-size: 12px; }
      .rubric th { background: #1A3A5C; color: white; font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase; padding: 7px 10px; text-align: left; }
      .rubric td { padding: 7px 10px; border-bottom: 1px solid #e0d8cc; vertical-align: top; line-height: 1.45; }
      .rubric tr:nth-child(even) td { background: rgba(26,58,92,0.04); }
      .score-col { white-space: nowrap; font-weight: 700; color: #1A3A5C; width: 130px; }
      .footer-line { margin-top: 24px; padding-top: 14px; border-top: 1px solid #d8d0c0; font-size: 10px; color: #aaa; font-style: italic; font-family: 'DM Mono', monospace; letter-spacing: 0.08em; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    `

    const memoHTML = `<div class="doc">
      <div class="top-bar"></div>
      <div class="logo-line"><span>Velocity Talent · AI-Driven Technical Recruiting</span><span>${today}</span></div>
      <div class="title-block"><h2>Sourcing Strategy Memo</h2><div class="role-sub">${result.role} — ${result.company}</div></div>
      <div class="meta-grid">
        <div class="meta-cell"><span class="meta-label">Seniority</span><span class="meta-val">${result.seniority}</span></div>
        <div class="meta-cell"><span class="meta-label">Clearance</span><span class="meta-val">${result.clearance}</span></div>
        <div class="meta-cell"><span class="meta-label">Est. Timeline</span><span class="meta-val">${m.time_estimate}</span></div>
      </div>
      <div class="section"><h3>Role Overview</h3><p>${m.overview}</p></div>
      <div class="section"><h3>Ideal Candidate Profile</h3><ul>${m.ideal_profile.map(i => `<li>${i}</li>`).join('')}</ul></div>
      <div class="section"><h3>Sourcing Strategies</h3><ul>${m.sourcing_strategies.map(s => `<li><strong>${s.channel}:</strong> ${s.approach}</li>`).join('')}</ul></div>
      <div class="section"><h3>Boolean Search Strings</h3>${m.boolean_strings.map(b => `<div class="bool-label">${b.platform}</div><div class="bool-block">${b.string}</div>`).join('')}</div>
      <div class="section"><h3>Market Notes</h3><p>${m.market_notes}</p></div>
      <div class="footer-line">Prepared by Velocity Talent · AI-Augmented Recruiting · Confidential · velocitytalent.ai</div>
    </div>`

    const guideHTML = `<div class="doc">
      <div class="top-bar guide-bar"></div>
      <div class="logo-line"><span>Velocity Talent · Interview Guide</span><span>${result.role} · ${result.company}</span></div>
      <div class="title-block">
        <h2>Interview Guide — ${result.role}</h2>
        <p class="guide-sub">${g.overview}</p>
        <div class="cats">${g.categories.map(c => `<span class="cat">${c}</span>`).join('')}</div>
      </div>
      <div class="tier-head screening">Tier 1 — Screening</div>
      ${g.screening_questions.map(q => `<div class="q-card"><div class="q-text">${q.question}</div><div class="q-probe">Probe: ${q.probe}</div></div>`).join('')}
      <div class="tier-head intermediate">Tier 2 — Intermediate</div>
      ${g.intermediate_questions.map(q => `<div class="q-card q-mid"><div class="q-text">${q.question}</div><div class="q-probe">Probe: ${q.probe}</div></div>`).join('')}
      <div class="tier-head expert">Tier 3 — Expert</div>
      ${g.expert_questions.map(q => `<div class="q-card q-exp"><div class="q-text">${q.question}</div><div class="q-probe">Probe: ${q.probe}</div></div>`).join('')}
      <div class="signals-grid">
        <div class="sig-col red"><h4>Red Flags</h4>${g.red_flags.map(f => `<div class="sig-item">✕ ${f}</div>`).join('')}</div>
        <div class="sig-col green"><h4>Green Lights</h4>${g.green_lights.map(f => `<div class="sig-item">✓ ${f}</div>`).join('')}</div>
      </div>
      <div class="rubric-head">Scoring Rubric</div>
      <table class="rubric"><thead><tr><th>Score</th><th>What It Looks Like</th></tr></thead><tbody>
        ${g.rubric.map(r => `<tr><td class="score-col">${r.score}</td><td>${r.description}</td></tr>`).join('')}
      </tbody></table>
      <div class="footer-line">Prepared by Velocity Talent · AI-Augmented Recruiting · For client use only · velocitytalent.ai</div>
    </div>`

    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${isMemo ? 'Sourcing Memo' : 'Interview Guide'} — ${result.role}</title><style>${printCSS}</style></head><body>${isMemo ? memoHTML : guideHTML}</body></html>`)
    win.document.close()
    win.onload = () => { win.focus(); win.print() }
  }

  return (
    <div className="app">
      <div className="noise" />
      <div className="glow" />
      <div className="glow2" />
      <div className="inner">

        {/* HEADER */}
        <div className="header">
          <div className="header-kicker">Velocity Talent · Free Taste Tool</div>
          <h1>Sourcing Memo<br />& <em>Interview Guide</em><br />Generator</h1>
          <p className="header-sub">Paste a job description. Get a complete client-ready deliverable package in seconds — the same one you'd send a prospect as your free taste offer.</p>
          <div className="deliverables">
            {['Candidate Profile', '3 Sourcing Strategies', '2 Boolean Strings', 'Market Notes', 'Tiered Interview Questions', 'Scoring Rubric', 'Red & Green Flags'].map(d => (
              <span className="badge" key={d}><span className="badge-dot" />{d}</span>
            ))}
          </div>
        </div>

        {/* INPUT */}
        <div className="input-section">
          <label className="input-label">Job Description</label>
          <p className="input-hint">Paste the full JD — the more detail, the better the output. Responsibilities, requirements, clearance level, tech stack.</p>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste job description here..."
            rows={10}
          />
          <div className="row-2col">
            <div>
              <label className="input-label" style={{ marginTop: 0 }}>Company Name <span className="opt">optional</span></label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Federal Solutions" />
            </div>
            <div>
              <label className="input-label" style={{ marginTop: 0 }}>Role Title Override <span className="opt">optional</span></label>
              <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior M365 Developer" />
            </div>
          </div>

          <button className="generate-btn" onClick={generate} disabled={loading || !jd.trim()}>
            {loading && <span className="spinner" />}
            {loading ? 'Generating Package...' : 'Generate Deliverable Package'}
          </button>

          {loading && (
            <>
              <div className="progress-bar"><div className="progress-fill" /></div>
              <div className="status-text">{STATUSES[statusIdx]}</div>
            </>
          )}

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* OUTPUT */}
        {result && (
          <div className="output-section">
            <div className="output-header">
              <span className="output-title">Package Ready — {result.role}</span>
              <div className="output-tabs">
                <button className={`otab${activeTab === 'memo' ? ' active' : ''}`} onClick={() => setActiveTab('memo')}>Sourcing Memo</button>
                <button className={`otab${activeTab === 'guide' ? ' active' : ''}`} onClick={() => setActiveTab('guide')}>Interview Guide</button>
              </div>
            </div>

            <div className="action-row">
              <button className="action-btn primary" onClick={() => copyText(getMemoText(), 'all')}>
                {copied === 'all' ? '✓ Copied!' : 'Copy Full Package'}
              </button>
              <button className="action-btn" onClick={() => exportPDF('memo')}>↓ Memo PDF</button>
              <button className="action-btn" onClick={() => exportPDF('guide')}>↓ Guide PDF</button>
              <button className="action-btn" onClick={() => { setResult(null); setJd(''); setCompany(''); setRole('') }}>
                Start Over
              </button>
            </div>

            {/* MEMO TAB */}
            {activeTab === 'memo' && (
              <div className="memo-doc">
                <div className="memo-logo-line">
                  <span>Velocity Talent · AI-Driven Technical Recruiting</span>
                  <span>{today}</span>
                </div>
                <div className="memo-title-block">
                  <h2>Sourcing Strategy Memo</h2>
                  <div className="memo-role">{result.role} — {result.company}</div>
                </div>
                <div className="memo-meta-grid">
                  <div className="memo-meta-cell"><span className="mmc-label">Seniority</span><span className="mmc-val">{result.seniority}</span></div>
                  <div className="memo-meta-cell"><span className="mmc-label">Clearance</span><span className="mmc-val">{result.clearance}</span></div>
                  <div className="memo-meta-cell"><span className="mmc-label">Est. Timeline</span><span className="mmc-val">{result.memo.time_estimate}</span></div>
                </div>
                <div className="memo-section"><h3>Role Overview</h3><p>{result.memo.overview}</p></div>
                <div className="memo-section">
                  <h3>Ideal Candidate Profile</h3>
                  <ul>{result.memo.ideal_profile.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div className="memo-section">
                  <h3>Sourcing Strategies</h3>
                  <ul>{result.memo.sourcing_strategies.map((s, i) => <li key={i}><strong>{s.channel}:</strong> {s.approach}</li>)}</ul>
                </div>
                <div className="memo-section">
                  <h3>Boolean Search Strings</h3>
                  {result.memo.boolean_strings.map((b, i) => (
                    <div key={i}>
                      <p className="bool-platform">{b.platform}</p>
                      <div className="boolean-block">{b.string}</div>
                    </div>
                  ))}
                </div>
                <div className="memo-section"><h3>Market Notes</h3><p>{result.memo.market_notes}</p></div>
                <div className="memo-footer">Prepared by Velocity Talent · AI-Augmented Recruiting · Confidential · velocitytalent.ai</div>
              </div>
            )}

            {/* GUIDE TAB */}
            {activeTab === 'guide' && (
              <div className="guide-doc">
                <div className="guide-logo-line">
                  <span>Velocity Talent · Interview Guide</span>
                  <span>{result.role} · {result.company}</span>
                </div>
                <div className="guide-title-block">
                  <h2>Interview Guide — {result.role}</h2>
                  <p className="guide-sub">{result.guide.overview}</p>
                  <div className="cats">
                    {result.guide.categories.map((c, i) => <span key={i} className="cat">{c}</span>)}
                  </div>
                </div>

                <div className="tier-block">
                  <span className="tier-label tier-screening">Tier 1 — Screening</span>
                  {result.guide.screening_questions.map((q, i) => (
                    <div className="q-card" key={i}>
                      <div className="q-text">{q.question}</div>
                      <div className="q-probe">{q.probe}</div>
                    </div>
                  ))}
                </div>
                <div className="tier-block">
                  <span className="tier-label tier-intermediate">Tier 2 — Intermediate</span>
                  {result.guide.intermediate_questions.map((q, i) => (
                    <div className="q-card q-mid" key={i}>
                      <div className="q-text">{q.question}</div>
                      <div className="q-probe">{q.probe}</div>
                    </div>
                  ))}
                </div>
                <div className="tier-block">
                  <span className="tier-label tier-expert">Tier 3 — Expert</span>
                  {result.guide.expert_questions.map((q, i) => (
                    <div className="q-card q-exp" key={i}>
                      <div className="q-text">{q.question}</div>
                      <div className="q-probe">{q.probe}</div>
                    </div>
                  ))}
                </div>

                <div className="signals-section">
                  <h3>Signals</h3>
                  <div className="signals-grid">
                    <div className="sig-col red">
                      <h4>Red Flags</h4>
                      {result.guide.red_flags.map((f, i) => <div className="sig-item" key={i}>✕ {f}</div>)}
                    </div>
                    <div className="sig-col green">
                      <h4>Green Lights</h4>
                      {result.guide.green_lights.map((f, i) => <div className="sig-item" key={i}>✓ {f}</div>)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3>Scoring Rubric</h3>
                  <table className="rubric-table">
                    <thead><tr><th>Score</th><th>What It Looks Like</th></tr></thead>
                    <tbody>
                      {result.guide.rubric.map((r, i) => (
                        <tr key={i}><td className="score-col">{r.score}</td><td>{r.description}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="memo-footer">Prepared by Velocity Talent · AI-Augmented Recruiting · For client use only · velocitytalent.ai</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
