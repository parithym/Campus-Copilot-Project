import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function TpoDashboard() {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/tpo/stats'), api.get('/tpo/students')])
      .then(([s, st]) => { setStats(s.data); setStudents(st.data) })
      .finally(() => setLoading(false))
  }, [])

  const viewStudent = async (id) => {
    setSelected(id); setDetail(null)
    const r = await api.get(`/tpo/students/${id}`)
    setDetail(r.data)
  }

  const filtered = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.targetRole?.toLowerCase().includes(search.toLowerCase())
  )

  const STAGE_COLORS = { Applied: 'bg-blue-100 text-blue-700', Shortlisted: 'bg-yellow-100 text-yellow-700', Interview: 'bg-purple-100 text-purple-700', Offer: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Placement monitor</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total students', value: stats?.totalStudents },
          { label: 'Placed', value: stats?.placedStudents },
          { label: 'Total applications', value: stats?.totalApplications },
          { label: 'Offers received', value: stats?.offersReceived },
        ].map(({ label, value }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Top companies */}
      {stats?.topCompanies?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Top hiring companies</h2>
          <div className="space-y-3">
            {stats.topCompanies.map(c => (
              <div key={c._id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 w-36 truncate">{c._id}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full">
                  <div className="h-2 bg-indigo-400 rounded-full" style={{ width: `${Math.min(100, c.offers * 25)}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-16 text-right">{c.offers} offer{c.offers > 1 ? 's' : ''}</span>
                {c.avgCTC > 0 && <span className="text-xs text-green-600 w-20 text-right">₹{(c.avgCTC / 100000).toFixed(1)} LPA</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students table */}
      <div className="card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 className="font-semibold text-slate-700">All students</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} className="input w-64" placeholder="Search by name, email, role..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {['Name', 'Department', 'Target role', 'CGPA', 'Skills', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{s.user?.name}</p>
                    <p className="text-xs text-slate-400">{s.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.department || '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{s.targetRole || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.cgpa || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{s.skills?.length || 0} skills</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => viewStudent(s._id)} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{detail?.student?.user?.name || 'Loading...'}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            {!detail ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {[['Dept', detail.student.department], ['CGPA', detail.student.cgpa], ['Target', detail.student.targetRole], ['Year', detail.student.graduationYear], ['Resume', detail.student.resumeUrl ? 'Uploaded' : 'Not uploaded'], ['Placed', detail.student.isPlaced ? 'Yes' : 'No']].map(([k, v]) => (
                    <div key={k} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-400">{k}</p>
                      <p className="font-medium text-slate-700 text-xs mt-0.5 truncate">{v || '—'}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.student.skills?.map(s => <span key={s} className="badge bg-indigo-50 text-indigo-600">{s}</span>)}
                    {!detail.student.skills?.length && <p className="text-sm text-slate-400">None</p>}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Applications ({detail.applications.length})</p>
                  <div className="space-y-2">
                    {detail.applications.map(a => (
                      <div key={a._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{a.companyName}</p>
                          <p className="text-xs text-slate-400">{a.role}</p>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${STAGE_COLORS[a.stage]}`}>{a.stage}</span>
                          {a.ctc > 0 && <p className="text-xs text-green-600 mt-1">₹{(a.ctc / 100000).toFixed(1)} LPA</p>}
                        </div>
                      </div>
                    ))}
                    {!detail.applications.length && <p className="text-sm text-slate-400">No applications yet</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
