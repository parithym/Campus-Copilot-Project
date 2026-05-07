import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ResumePage() {
  const [profile, setProfile] = useState(null)
  const [apps, setApps] = useState([])
  const [selectedApp, setSelectedApp] = useState('')
  const [jd, setJd] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/student/profile').then(r => setProfile(r.data))
    api.get('/applications').then(r => setApps(r.data))
  }, [])

  const onAppSelect = e => {
    const app = apps.find(a => a._id === e.target.value)
    setSelectedApp(e.target.value)
    if (app?.jobDescriptionText) setJd(app.jobDescriptionText)
    setResult(null)
  }

  const analyze = async () => {
    if (!jd.trim()) return toast.error('Paste a job description first')
    if (!profile?.resumeUrl) return toast.error('Upload your resume in Profile first')
    setLoading(true); setResult(null)
    try {
      const r = await api.post('/ai/analyze-resume', { jobDescription: jd })
      setResult(r.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Check AI service is running.')
    } finally { setLoading(false) }
  }

  const saveToApp = async () => {
    if (!selectedApp || !result) return
    setSaving(true)
    try {
      await api.patch(`/applications/${selectedApp}/ai-result`, {
        matchScore: result.matchScore,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions
      })
      toast.success('Saved to application!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const scoreColor = s => s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-600' : 'text-red-600'
  const barColor = s => s >= 70 ? 'bg-green-500' : s >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI resume analyzer</h1>
        <p className="text-slate-500 text-sm mt-1">Match your resume against a job description using AI</p>
      </div>

      {!profile?.resumeUrl && (
        <div className="card p-4 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-sm text-amber-700 font-medium">⚠ No resume uploaded</p>
          <p className="text-xs text-amber-600 mt-1">Go to <a href="/profile" className="underline">Profile</a> to upload your resume first.</p>
        </div>
      )}

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Link to an application (optional)</label>
          <select value={selectedApp} onChange={onAppSelect} className="input">
            <option value="">Select application to auto-fill JD</option>
            {apps.map(a => <option key={a._id} value={a._id}>{a.companyName} — {a.role}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Job description *</label>
          <textarea
            value={jd} onChange={e => setJd(e.target.value)}
            className="input min-h-48 resize-none font-mono text-xs"
            placeholder="Paste the full job description here..."
          />
        </div>
        <button onClick={analyze} disabled={loading || !profile?.resumeUrl} className="btn-primary w-full">
          {loading ? '⏳ Analyzing with AI...' : '✦ Analyze resume'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-700">Match score</h2>
              <span className={`text-3xl font-bold ${scoreColor(result.matchScore)}`}>{result.matchScore}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full">
              <div className={`h-3 rounded-full transition-all ${barColor(result.matchScore)}`} style={{ width: `${result.matchScore}%` }} />
            </div>
            <p className="text-sm text-slate-500 mt-3">{result.overallFeedback}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Matched */}
            <div className="card p-5">
              <h3 className="font-semibold text-green-700 mb-3">✓ Matched keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords?.map(k => (
                  <span key={k} className="badge bg-green-100 text-green-700">{k}</span>
                ))}
                {!result.matchedKeywords?.length && <p className="text-sm text-slate-400">None found</p>}
              </div>
            </div>

            {/* Missing */}
            <div className="card p-5">
              <h3 className="font-semibold text-red-600 mb-3">✕ Missing keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords?.map(k => (
                  <span key={k} className="badge bg-red-100 text-red-600">{k}</span>
                ))}
                {!result.missingKeywords?.length && <p className="text-sm text-slate-400">None! Great match.</p>}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-2">💡 AI suggestions</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{result.suggestions}</p>
          </div>

          {selectedApp && (
            <button onClick={saveToApp} disabled={saving} className="btn-secondary w-full">
              {saving ? 'Saving...' : '💾 Save result to application'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
