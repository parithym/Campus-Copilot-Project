import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected']
const STAGE_COLORS = {
  Applied: 'bg-blue-100 text-blue-700',
  Shortlisted: 'bg-yellow-100 text-yellow-700',
  Interview: 'bg-purple-100 text-purple-700',
  Offer: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/applications'), api.get('/student/profile')])
      .then(([aRes, pRes]) => { setApps(aRes.data); setProfile(pRes.data) })
      .finally(() => setLoading(false))
  }, [])

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.stage === s).length
    return acc
  }, {})

  const upcoming = apps
    .filter(a => a.deadline && new Date(a.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3)

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's your placement overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {STAGES.map(stage => (
          <div key={stage} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{stage}</p>
            <p className="text-2xl font-bold text-slate-800">{stageCounts[stage]}</p>
            <span className={`badge mt-2 ${STAGE_COLORS[stage]}`}>{stage}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile completeness */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Profile completeness</h2>
          {[
            { label: 'Skills added', done: profile?.skills?.length > 0 },
            { label: 'Target role set', done: !!profile?.targetRole },
            { label: 'Resume uploaded', done: !!profile?.resumeUrl },
            { label: 'LinkedIn added', done: !!profile?.linkedIn },
            { label: 'Department set', done: !!profile?.department },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {done ? '✓' : '○'}
              </span>
              <span className={`text-sm ${done ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
              {!done && <Link to="/profile" className="ml-auto text-xs text-indigo-500 hover:underline">Add →</Link>}
            </div>
          ))}
        </div>

        {/* Upcoming deadlines */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Upcoming deadlines</h2>
            <Link to="/kanban" className="text-xs text-indigo-500 hover:underline">View all →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No upcoming deadlines</p>
          ) : (
            upcoming.map(app => {
              const days = Math.ceil((new Date(app.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={app._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{app.companyName}</p>
                    <p className="text-xs text-slate-400">{app.role}</p>
                  </div>
                  <span className={`badge ${days <= 3 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {days}d left
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-700 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/kanban" className="btn-primary text-sm">+ Add application</Link>
          <Link to="/resume" className="btn-secondary text-sm">Analyze resume</Link>
          <Link to="/skill-gap" className="btn-secondary text-sm">Check skill gap</Link>
          <Link to="/profile" className="btn-secondary text-sm">Edit profile</Link>
        </div>
      </div>
    </div>
  )
}
