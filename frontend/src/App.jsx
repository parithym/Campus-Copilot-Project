import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import StudentDashboard from './pages/StudentDashboard'
import KanbanPage from './pages/KanbanPage'
import ProfilePage from './pages/ProfilePage'
import ResumePage from './pages/ResumePage'
import SkillGapPage from './pages/SkillGapPage'
import TpoDashboard from './pages/TpoDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600 font-medium">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'tpo') return <Navigate to="/tpo" replace />
  return <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Student routes */}
          <Route path="/" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="skill-gap" element={<SkillGapPage />} />
          </Route>

          {/* TPO routes */}
          <Route path="/tpo" element={<ProtectedRoute roles={['tpo', 'admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<TpoDashboard />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
