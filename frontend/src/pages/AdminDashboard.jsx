import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ROLE_BADGE = { student: 'bg-blue-100 text-blue-700', tpo: 'bg-purple-100 text-purple-700', admin: 'bg-red-100 text-red-700' }

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', college: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetch = () => api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const create = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/admin/users', form)
      toast.success('User created'); setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'student', college: '' })
      fetch()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const toggle = async (id) => {
    const r = await api.patch(`/admin/users/${id}/toggle`)
    setUsers(p => p.map(u => u._id === id ? { ...u, isActive: r.data.isActive } : u))
    toast.success('Status updated')
  }

  const del = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers(p => p.filter(u => u._id !== id))
    toast.success('User deleted')
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.includes(search.toLowerCase())
  )

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Admin panel</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Create user</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {['student', 'tpo', 'admin'].map(role => (
          <div key={role} className="card p-5">
            <p className="text-xs text-slate-500 capitalize">{role}s</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{users.filter(u => u.role === role).length}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700">All users ({filtered.length})</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} className="input w-64" placeholder="Search..." />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                {['Name', 'Email', 'Role', 'College', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-slate-500">{u.college || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggle(u._id)} className="text-xs text-slate-500 hover:text-indigo-600 font-medium">
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => del(u._id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Create user</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={create} className="p-6 space-y-4">
              <div>
                <label className="label">Full name</label>
                <input name="name" value={form.name} onChange={handle} className="input" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} className="input" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handle} className="input" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Role</label>
                  <select name="role" value={form.role} onChange={handle} className="input">
                    <option value="student">Student</option>
                    <option value="tpo">TPO</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">College</label>
                  <input name="college" value={form.college} onChange={handle} className="input" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
