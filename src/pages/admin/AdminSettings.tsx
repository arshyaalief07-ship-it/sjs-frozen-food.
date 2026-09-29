import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSettings } from '@/hooks/useSettings'
import { Loading } from '@/components/Feedback'

const FIELDS: { key: string; label: string; type?: 'text' | 'textarea' }[] = [
  { key: 'site_name', label: 'Nama Website' },
  { key: 'slogan', label: 'Slogan' },
  { key: 'store_address', label: 'Alamat Toko', type: 'textarea' },
  { key: 'google_maps_url', label: 'URL Google Maps' },
  { key: 'seo_title', label: 'SEO Title' },
  { key: 'seo_description', label: 'SEO Description', type: 'textarea' },
]

export default function AdminSettings() {
  const { settings, loading, refetch } = useSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    // Hanya menyimpan kunci milik halaman ini agar tidak menimpa pengaturan lain
    const rows = FIELDS.map((f) => ({ key: f.key, value: form[f.key] ?? '' }))
    const { error: err } = await supabase.from('settings').upsert(rows, { onConflict: 'key' })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    await refetch()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <Loading />

  return (
    <form onSubmit={handleSave}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="mt-1 text-sm text-slate-500">Pengaturan umum website, alamat, dan SEO.</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
        </button>
      </div>

      {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-600">{error}</p>}

      <div className="card max-w-2xl p-6">
        <div className="flex flex-col gap-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="label" htmlFor={field.key}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  className="input resize-none"
                  rows={3}
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
    </form>
  )
}
