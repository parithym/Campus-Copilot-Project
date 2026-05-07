import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.college)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Career Copilot</h1>
          <p className="text-slate-500 mt-2">Start your placement journey</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Create your account</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input name="name" value={form.name} onChange={handle} className="input" placeholder="Rahul Sharma" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="rahul@college.edu" required />
            </div>
            <div>
              <label className="label">College</label>
              <input name="college" value={form.college} onChange={handle} className="input" placeholder="VIT Vellore" />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="Min 6 characters" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
