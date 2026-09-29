import { SettingsMap } from '@/types'

/** Ambil kata kunci lokasi dari URL Maps di settings; bila gagal, pakai nama + alamat toko. */
export function mapsQuery(settings: SettingsMap): string {
  try {
    const q = new URL(settings.google_maps_url).searchParams.get('query')
    if (q) return q
  } catch {
    // URL tidak valid -> fallback
  }
  return `${settings.site_name}, ${settings.store_address}`
}

/** Embed Google Maps tanpa API key. */
export function mapsEmbedUrl(settings: SettingsMap): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery(settings))}&output=embed`
}
