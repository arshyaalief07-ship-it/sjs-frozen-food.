import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Loading } from '@/components/Feedback'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isAdmin, loading, signOut } = useAuth()

  if (loading) return <Loading label="Memeriksa akses admin..." />
  if (!session) return <Navigate to="/admin/login" replace />
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="font-display text-xl font-bold text-slate-800">Akses Ditolak</p>
        <p className="text-sm text-slate-500">Akun Anda tidak memiliki hak akses admin.</p>
        <div className="mt-2 flex gap-3">
          <Link to="/" className="btn-secondary">
            Ke Beranda
          </Link>
          <button type="button" onClick={signOut} className="btn-primary">
            Keluar
          </button>
        </div>
      </div>
    )
  }
  return <>{children}</>
}
