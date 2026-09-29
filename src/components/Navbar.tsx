import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { SettingsMap, WhatsAppDestination } from '@/types'
import { whatsappUrlByPhone } from '@/utils/whatsapp'
import BrandLogo from '@/components/BrandLogo'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/produk', label: 'Produk' },
  { to: '/promo', label: 'Promo' },
  { to: '/#lokasi', label: 'Tentang / Lokasi' },
]

function linkActive(to: string, isActive: boolean, hash: string): boolean {
  if (to.includes('#')) return isActive && hash === '#lokasi'
  if (to === '/') return isActive && hash !== '#lokasi'
  return isActive
}

export default function Navbar({
  settings,
  whatsapp,
}: {
  settings: SettingsMap
  whatsapp: WhatsAppDestination | null
}) {
  const { hash } = useLocation()
  const waHref = whatsapp
    ? whatsappUrlByPhone(whatsapp.phone, `Halo ${settings.site_name}, saya ingin bertanya tentang produk.`)
    : null
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { totalItems, openCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/produk?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? 'border-slate-100 bg-white/90 shadow-card backdrop-blur' : 'border-transparent bg-white/70 backdrop-blur-sm'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="container-app flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-brand-700">
          <BrandLogo settings={settings} nameClassName="hidden sm:inline" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  linkActive(link.to, isActive, hash)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                }`
              }
              end
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nugget, sosis, udang..."
                className="w-56 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                aria-label="Cari produk"
              />
            </form>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Buka pencarian"
          >
            <Search className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Buka keranjang"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp hidden sm:inline-flex">
              WhatsApp
            </a>
          )}

          <button
            type="button"
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Buka menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-slate-100 bg-white p-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="input pl-9"
              aria-label="Cari produk"
            />
          </form>
        </div>
      )}

      {mobileOpen && (
        <nav className="border-t border-slate-100 bg-white lg:hidden">
          <div className="container-app flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-3 text-sm font-semibold ${
                    linkActive(link.to, isActive, hash) ? 'bg-brand-50 text-brand-700' : 'text-slate-600'
                  }`
                }
                end
              >
                {link.label}
              </NavLink>
            ))}
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-2">
                Hubungi via WhatsApp
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
