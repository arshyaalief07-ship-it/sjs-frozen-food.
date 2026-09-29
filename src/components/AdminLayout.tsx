import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Tags,
  Sparkles,
  Phone,
  Globe,
  Settings,
  Menu,
  X,
  LogOut,
  Snowflake,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Produk', icon: Package },
  { to: '/admin/categories', label: 'Kategori', icon: Tags },
  { to: '/admin/promos', label: 'Promo', icon: Sparkles },
  { to: '/admin/whatsapp', label: 'WhatsApp', icon: Phone },
  { to: '/admin/website', label: 'Website', icon: Globe },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5 font-display text-lg font-extrabold text-brand-700">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
          <Snowflake className="h-5 w-5" />
        </span>
        SJS Admin
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="mb-2 truncate text-xs text-slate-400">{profile?.email}</p>
        <button type="button" onClick={handleSignOut} className="btn-ghost w-full justify-start gap-2 text-rose-600 hover:bg-rose-50">
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white lg:block">{SidebarContent}</aside>

      <div className={`fixed inset-0 z-40 lg:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-2xl transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {SidebarContent}
        </div>
      </div>

      <div className="flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Buka menu admin"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-slate-800">SJS Admin</span>
          {mobileOpen && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="ml-auto rounded-full p-2 text-slate-600 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
