import { useEffect, useState } from 'react'
import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import api from '../api/axios'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)
import toast from 'react-hot-toast'

const ROLES = ['Software Development Engineer', 'Data Analyst', 'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Product Manager']

export default function SkillGapPage() {
  const [profile, setProfile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/student/profile').then(r => {
      setProfile(r.data)
      if (r.data.targetRole) setTargetRole(r.data.targetRole)
    })
  }, [])

  const analyze = async () => {
    if (!targetRole) return toast.error('Select a target role')
    if (!profile?.skills?.length) return toast.error('Add skills to your profile first')
    setLoading(true); setResult(null)
    try {
      const r = await api.post('/ai/skill-gap', { skills: profile.skills, targetRole })
      setResult(r.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally { setLoading(false) }
  }

  const readinessColor = s => s >= 70 ? 'text-green-600' : s >= 40 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Skill gap analyzer</h1>
        <p className="text-slate-500 text-sm mt-1">See how ready you are for your target role</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Your current skills</label>
          <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg min-h-12 border border-slate-100">
            {profile?.skills?.length ? profile.skills.map(s => (
              <span key={s} className="badge bg-indigo-100 text-indigo-700">{s}</span>
            )) : <p className="text-sm text-slate-400">No skills added yet — go to Profile</p>}
          </div>
        </div>
        <div>
          <label className="label">Target role</label>
          <select value={targetRole} onChange={e => { setTargetRole(e.target.value); setResult(null) }} className="input">
            <option value="">Select target role</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary w-full">
          {loading ? '⏳ Analyzing...' : '◎ Analyze skill gap'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Readiness score */}
          <div className="card p-6 text-center">
            <p className="text-slate-500 text-sm mb-1">Role readiness</p>
            <p className={`text-5xl font-bold mb-2 ${readinessColor(result.readinessScore)}`}>{result.readinessScore}%</p>
            <p className="text-slate-600 text-sm">
              You have <span className="font-semibold text-indigo-600">{result.matchedSkills.length}</span> of{' '}
              <span className="font-semibold">{result.requiredSkills.length}</span> required skills for <span className="font-semibold">{result.targetRole}</span>
            </p>
          </div>

          {/* Radar chart */}
          {result.radarData?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-slate-700 mb-4">Skill radar</h3>
              <div className="max-w-sm mx-auto">
                <Radar
                  data={{
                    labels: result.radarData.map(d => d.skill),
                    datasets: [{
                      label: 'Proficiency',
                      data: result.radarData.map(d => d.score),
                      backgroundColor: 'rgba(99,102,241,0.15)',
                      borderColor: '#6366f1',
                      pointBackgroundColor: '#6366f1',
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 9 } }, pointLabels: { font: { size: 11 } } } },
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {/* Have */}
            <div className="card p-5">
              <h3 className="font-semibold text-green-700 mb-3">✓ Skills you have</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map(s => <span key={s} className="badge bg-green-100 text-green-700">{s}</span>)}
                {!result.matchedSkills.length && <p className="text-sm text-slate-400">None matched</p>}
              </div>
            </div>

            {/* Missing */}
            <div className="card p-5">
              <h3 className="font-semibold text-red-600 mb-3">✕ Skills to learn</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => <span key={s} className="badge bg-red-100 text-red-600">{s}</span>)}
                {!result.missingSkills.length && <p className="text-sm text-green-600 font-medium">You have all required skills! 🎉</p>}
              </div>
            </div>
          </div>

          {result.missingSkills.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-3">📚 Learning roadmap</h3>
              <div className="space-y-3">
                {result.missingSkills.map((skill, i) => (
                  <div key={skill} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700">{skill}</p>
                      <p className="text-xs text-slate-400">Search "{skill} tutorial" on YouTube or freeCodeCamp</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
