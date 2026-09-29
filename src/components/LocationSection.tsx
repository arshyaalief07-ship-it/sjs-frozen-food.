import { MapPin } from 'lucide-react'
import { SettingsMap } from '@/types'
import { mapsEmbedUrl } from '@/utils/maps'

export default function LocationSection({ settings }: { settings: SettingsMap }) {
  return (
    <section id="lokasi" className="container-app scroll-mt-24 py-14">
      <div className="reveal grid items-center gap-8 rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:p-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{settings.location_section_title}</h2>
          <p className="mt-2 font-display text-lg font-semibold">{settings.site_name}</p>
          <p className="mt-3 max-w-md text-sm text-white/85">{settings.store_address}</p>
          <a
            href={settings.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-700 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <MapPin className="h-4 w-4" /> Lihat Lokasi di Google Maps
          </a>
        </div>

        {/* Peta tersemat tanpa API key. Placeholder di belakang iframe tetap terlihat bila peta gagal dimuat. */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-white/10 sm:h-72">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-white/80">
            <MapPin className="h-10 w-10" aria-hidden />
            <p className="text-xs">Peta tidak tampil? Gunakan tombol &ldquo;Lihat Lokasi di Google Maps&rdquo;.</p>
          </div>
          <iframe
            title={`Peta lokasi ${settings.site_name}`}
            src={mapsEmbedUrl(settings)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
