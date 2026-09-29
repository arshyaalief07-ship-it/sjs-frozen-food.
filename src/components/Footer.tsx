import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'
import { SettingsMap, WhatsAppDestination } from '@/types'
import { whatsappUrlByPhone } from '@/utils/whatsapp'

export default function Footer({
  settings,
  destinations,
}: {
  settings: SettingsMap
  destinations: WhatsAppDestination[]
}) {
  return (
    <footer className="mt-16 border-t border-slate-100 bg-gradient-to-b from-white to-brand-50/60">
      <div className="container-app reveal grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold text-brand-700">
            <BrandLogo settings={settings} />
          </div>
          <p className="text-sm text-slate-500">{settings.slogan}</p>
        </div>

        <div>
          <h4 className="mb-3 font-display font-bold text-slate-800">Navigasi</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-brand-600">Home</Link></li>
            <li><Link to="/produk" className="hover:text-brand-600">Produk</Link></li>
            <li><Link to="/promo" className="hover:text-brand-600">Promo</Link></li>
            <li><Link to="/#lokasi" className="hover:text-brand-600">Lokasi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-display font-bold text-slate-800">Lokasi Toko</h4>
          <p className="mb-3 text-sm text-slate-500">{settings.store_address}</p>
          <a
            href={settings.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs"
          >
            <MapPin className="h-4 w-4" /> Lihat Lokasi di Google Maps
          </a>
        </div>

        <div>
          <h4 className="mb-3 font-display font-bold text-slate-800">WhatsApp</h4>
          <ul className="flex flex-col gap-2 text-sm">
            {destinations.map((d) => (
              <li key={d.id}>
                <a
                  href={whatsappUrlByPhone(d.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-brand-600"
                >
                  {d.name} <span className="text-slate-400">({d.role})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} {settings.site_name}. Semua hak dilindungi.
      </div>
    </footer>
  )
}
