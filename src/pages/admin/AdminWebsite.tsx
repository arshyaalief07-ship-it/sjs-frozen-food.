import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSettings } from '@/hooks/useSettings'
import ImageUploader from '@/components/ImageUploader'
import { Loading } from '@/components/Feedback'
import { commitImage, noPendingImage, PendingImage, ImageCommit } from '@/lib/storage'

const BUCKET = 'site-images'

const TEXT_FIELDS: { key: string; label: string; type?: 'textarea' }[] = [
  { key: 'hero_title', label: 'Judul Hero' },
  { key: 'hero_subtitle', label: 'Subjudul Hero', type: 'textarea' },
  { key: 'hero_cta_text', label: 'Teks Tombol CTA Utama' },
  { key: 'hero_cta_secondary_text', label: 'Teks Tombol CTA Kedua' },
  { key: 'promo_section_title', label: 'Judul Section Promo' },
  { key: 'category_section_title', label: 'Judul Section Kategori' },
  { key: 'featured_section_title', label: 'Judul Section Produk Unggulan' },
  { key: 'how_to_order_title', label: 'Judul Section Cara Pesan' },
  { key: 'location_section_title', label: 'Judul Section Lokasi' },
]

const IMAGE_KEYS = ['logo_path', 'favicon_path', 'hero_image_path'] as const
type ImageKey = (typeof IMAGE_KEYS)[number]

const NO_PENDING: Record<ImageKey, PendingImage> = {
  logo_path: noPendingImage,
  favicon_path: noPendingImage,
  hero_image_path: noPendingImage,
}

export default function AdminWebsite() {
  const { settings, loading, refetch } = useSettings()
  const [form, setForm] = useState(settings)
  const [pending, setPending] = useState(NO_PENDING)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)

    const commits: Partial<Record<ImageKey, ImageCommit>> = {}
    try {
      // 1) unggah semua gambar yang dipilih  2) simpan settings  3) hapus gambar lama / rollback
      for (const key of IMAGE_KEYS) {
        commits[key] = await commitImage(BUCKET, form[key] || null, pending[key])
      }

      // Hanya menyimpan kunci milik halaman ini agar tidak menimpa pengaturan lain
      const values: Record<string, string> = {}
      TEXT_FIELDS.forEach((f) => (values[f.key] = form[f.key] ?? ''))
      IMAGE_KEYS.forEach((k) => (values[k] = commits[k]?.path ?? ''))

      const rows = Object.entries(values).map(([key, value]) => ({ key, value }))
      const { error: err } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
      if (err) throw new Error(err.message)

      await Promise.all(IMAGE_KEYS.map((k) => commits[k]?.finalize()))
      setPending(NO_PENDING)
      await refetch()
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      await Promise.all(IMAGE_KEYS.map((k) => commits[k]?.rollback()))
      setError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <form onSubmit={handleSave}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Kustomisasi Website</h1>
          <p className="mt-1 text-sm text-slate-500">Ubah logo, favicon, hero, dan teks homepage tanpa edit kode.</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
        </button>
      </div>
      {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="card p-6">
            <h2 className="mb-4 font-display font-bold text-slate-800">Brand</h2>
            <div className="flex flex-col gap-6">
              <ImageUploader
                bucket={BUCKET}
                label="Logo"
                hint="Kosongkan untuk memakai logo SJS bawaan."
                currentPath={form.logo_path || null}
                pending={pending.logo_path}
                onChange={(p) => setPending((s) => ({ ...s, logo_path: p }))}
              />
              <ImageUploader
                bucket={BUCKET}
                label="Favicon"
                hint="Disarankan persegi (PNG/ICO/SVG)."
                currentPath={form.favicon_path || null}
                pending={pending.favicon_path}
                onChange={(p) => setPending((s) => ({ ...s, favicon_path: p }))}
              />
            </div>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-display font-bold text-slate-800">Gambar Hero</h2>
            <ImageUploader
              bucket={BUCKET}
              label="Gambar Hero"
              currentPath={form.hero_image_path || null}
              pending={pending.hero_image_path}
              onChange={(p) => setPending((s) => ({ ...s, hero_image_path: p }))}
            />
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-display font-bold text-slate-800">Teks Homepage</h2>
          <div className="flex flex-col gap-4">
            {TEXT_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="label" htmlFor={field.key}>
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    className="input resize-none"
                    rows={2}
                    value={form[field.key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                ) : (
                  <input
                    id={field.key}
                    className="input"
                    value={form[field.key] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}
