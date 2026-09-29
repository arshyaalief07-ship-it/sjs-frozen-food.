import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Snowflake, LogIn } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLogin() {
  const { session, isAdmin, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session && isAdmin) return <Navigate to="/admin" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: err } = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError(err.toLowerCase().includes('admin') ? err : 'Email atau password salah.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
            <Snowflake className="h-6 w-6" />
          </span>
          <h1 className="font-display text-xl font-bold text-slate-900">Login Admin SJS</h1>
          <p className="text-center text-sm text-slate-500">Masuk untuk mengelola produk, promo, dan pengaturan.</p>
        </div>

        <div className="mb-4">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            placeholder="admin@sjsfrozenfood.com"
          />
        </div>
        <div className="mb-5">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="mb-4 text-sm font-medium text-rose-500">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <LogIn className="h-4 w-4" /> {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
