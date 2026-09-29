import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { SettingsMap } from '@/types'

/** Nilai cadangan hanya dipakai sebelum data dari Supabase dimuat / bila tabel settings kosong. */
export const DEFAULT_SETTINGS: SettingsMap = {
  site_name: 'SJS Frozen Food',
  slogan: 'Semua Favoritmu, Ada di SJS.',
  logo_path: '',
  favicon_path: '',
  hero_title: 'Semua Favoritmu, Ada di SJS.',
  hero_subtitle: 'Temukan berbagai pilihan frozen food SJS, cek ketersediaan, lalu pesan dengan mudah.',
  hero_image_path: '',
  hero_cta_text: 'Belanja Sekarang',
  hero_cta_secondary_text: 'Lihat Promo',
  promo_section_title: 'Promo Pilihan SJS',
  category_section_title: 'Kategori Favorit',
  featured_section_title: 'Produk Pilihan',
  how_to_order_title: 'Cara Pesan',
  location_section_title: 'Kunjungi Toko Kami',
  store_address:
    'Jl. Raya Pengasinan Kebon Kopi, RT 01/RW 06, Pengasinan, Kec. Sawangan, Kota Depok, Jawa Barat 16518',
  google_maps_url:
    'https://www.google.com/maps/search/?api=1&query=SJS+FROZEN+FOOD%2C+Jl.+Raya+Pengasinan+Kebon+Kopi%2C+Pengasinan%2C+Sawangan%2C+Depok',
  seo_title: 'SJS Frozen Food | Semua Favoritmu, Ada di SJS.',
  seo_description: 'Temukan berbagai pilihan frozen food SJS, cek ketersediaan, promo, dan pesan dengan mudah.',
}

interface SettingsContextValue {
  settings: SettingsMap
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // refetch bersifat "senyap": tidak menyalakan loading agar form admin tidak ter-unmount.
  const refetch = useCallback(async () => {
    const { data, error: err } = await supabase.from('settings').select('key, value')
    if (err) {
      setError(err.message)
      return
    }
    setError(null)
    const map: SettingsMap = { ...DEFAULT_SETTINGS }
    ;(data ?? []).forEach((row: { key: string; value: string | null }) => {
      map[row.key] = row.value || DEFAULT_SETTINGS[row.key] || ''
    })
    setSettings(map)
  }, [])

  useEffect(() => {
    refetch().finally(() => setLoading(false))
  }, [refetch])

  return <SettingsContext.Provider value={{ settings, loading, error, refetch }}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
