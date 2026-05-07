import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/kanban', label: 'Applications', icon: '⊞' },
  { to: '/resume', label: 'AI Resume', icon: '✦' },
  { to: '/skill-gap', label: 'Skill Gap', icon: '◎' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]
const tpoNav = [{ to: '/tpo', label: 'Placement Monitor', icon: '▦' }]
const adminNav = [{ to: '/admin', label: 'Admin Panel', icon: '⚙' }]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const nav = user?.role === 'student' ? studentNav
    : user?.role === 'tpo' ? tpoNav : adminNav

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-100">
          <span className="text-lg font-bold text-indigo-600">Career Copilot</span>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role} portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to} to={to} end={to === '/tpo' || to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span className="text-base">{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
