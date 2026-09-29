import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Category } from '@/types'
import { slugify } from '@/utils/format'
import { Loading, EmptyState } from '@/components/Feedback'

const emptyForm = { id: '', name: '', active: true, sort_order: 0 }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories((data as Category[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    setForm({ ...emptyForm, sort_order: categories.reduce((m, c) => Math.max(m, c.sort_order), 0) + 1 })
    setError(null)
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setForm({ id: cat.id, name: cat.name, active: cat.active, sort_order: cat.sort_order })
    setError(null)
    setShowModal(true)
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk terkait tidak akan terhapus.`)) return
    await supabase.from('categories').delete().eq('id', cat.id)
    loadData()
  }

  async function handleToggleActive(cat: Category) {
    await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id)
    loadData()
  }

  async function handleMove(cat: Category, direction: -1 | 1) {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex((c) => c.id === cat.id)
    const swapIdx = idx + direction
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const other = sorted[swapIdx]
    await Promise.all([
      supabase.from('categories').update({ sort_order: other.sort_order }).eq('id', cat.id),
      supabase.from('categories').update({ sort_order: cat.sort_order }).eq('id', other.id),
    ])
    loadData()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      active: form.active,
      sort_order: form.sort_order,
    }

    const res = form.id
      ? await supabase.from('categories').update(payload).eq('id', form.id)
      : await supabase.from('categories').insert(payload)

    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setShowModal(false)
    loadData()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Kategori</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola kategori produk yang tampil di homepage.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : categories.length === 0 ? (
        <EmptyState title="Belum ada kategori" />
      ) : (
        <div className="flex flex-col gap-3">
          {[...categories]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((cat, idx, arr) => (
              <div key={cat.id} className="card flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(cat, -1)}
                      className="p-0.5 text-slate-400 hover:text-brand-600 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === arr.length - 1}
                      onClick={() => handleMove(cat, 1)}
                      className="p-0.5 text-slate-400 hover:text-brand-600 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${cat.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {cat.active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(cat)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleDelete(cat)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-scale-in sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">{form.id ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Nama Kategori</label>
                <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="h-4 w-4 accent-brand-500"
                />
                Aktif
              </label>
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
