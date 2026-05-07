import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ROLES = ['Software Development Engineer', 'Data Analyst', 'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'Product Manager']
const DEPTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Other']

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get('/student/profile').then(r => {
      setProfile(r.data)
      setForm({ department: r.data.department, graduationYear: r.data.graduationYear, cgpa: r.data.cgpa, skills: r.data.skills || [], targetRole: r.data.targetRole, linkedIn: r.data.linkedIn, github: r.data.github, bio: r.data.bio })
    }).finally(() => setLoading(false))
  }, [])

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) { setForm(p => ({ ...p, skills: [...p.skills, s] })); setSkillInput('') }
  }

  const removeSkill = skill => setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await api.put('/student/profile', form)
      setProfile(r.data); toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const uploadResume = async e => {
    const file = e.target.files[0]; if (!file) return
    const fd = new FormData(); fd.append('resume', file)
    setUploading(true)
    try {
      await api.post('/student/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Resume uploaded!'); api.get('/student/profile').then(r => setProfile(r.data))
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My profile</h1>

      {/* Resume upload */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-700 mb-3">Resume</h2>
        {profile?.resumeUrl ? (
          <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <span className="text-green-600 text-lg">📄</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">{profile.resumeOriginalName || 'Resume uploaded'}</p>
              <p className="text-xs text-green-500">Uploaded successfully</p>
            </div>
            <label className="btn-secondary text-xs cursor-pointer">
              Replace <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} className="hidden" />
            </label>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
            <span className="text-3xl">📎</span>
            <p className="text-sm font-medium text-slate-600">{uploading ? 'Uploading...' : 'Click to upload resume'}</p>
            <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
            <input type="file" accept=".pdf,.doc,.docx" onChange={uploadResume} disabled={uploading} className="hidden" />
          </label>
        )}
      </div>

      {/* Profile form */}
      <form onSubmit={save} className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-700">Academic details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <select name="department" value={form.department} onChange={handle} className="input">
              <option value="">Select department</option>
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Graduation year</label>
            <input name="graduationYear" type="number" value={form.graduationYear} onChange={handle} className="input" min="2020" max="2030" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CGPA</label>
            <input name="cgpa" type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={handle} className="input" placeholder="8.5" />
          </div>
          <div>
            <label className="label">Target role</label>
            <select name="targetRole" value={form.targetRole} onChange={handle} className="input">
              <option value="">Select role</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="input flex-1" placeholder="Type a skill and press Enter" />
            <button type="button" onClick={addSkill} className="btn-secondary">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills?.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-indigo-700 text-xs">✕</button>
              </span>
            ))}
          </div>
        </div>

        <h2 className="font-semibold text-slate-700 pt-2">Links & bio</h2>
        <div>
          <label className="label">LinkedIn URL</label>
          <input name="linkedIn" value={form.linkedIn} onChange={handle} className="input" placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div>
          <label className="label">GitHub URL</label>
          <input name="github" value={form.github} onChange={handle} className="input" placeholder="https://github.com/yourname" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handle} className="input resize-none min-h-20" placeholder="Tell recruiters about yourself..." />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
