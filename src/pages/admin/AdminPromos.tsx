import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Promo, Product } from '@/types'
import { isPromoActive } from '@/utils/format'
import { Loading, EmptyState } from '@/components/Feedback'
import ImageUploader from '@/components/ImageUploader'
import { commitImage, removeStoredImage, noPendingImage, PendingImage, ImageCommit } from '@/lib/storage'

const emptyForm = {
  id: '',
  title: '',
  description: '',
  image_path: null as string | null,
  discount: null as number | null,
  start_at: '',
  end_at: '',
  active: true,
  productIds: [] as string[],
}

type PromoRow = Promo & { productIds: string[] }

export default function AdminPromos() {
  const [promos, setPromos] = useState<PromoRow[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [pendingImg, setPendingImg] = useState<PendingImage>(noPendingImage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const [{ data: promoData }, { data: prodData }] = await Promise.all([
      supabase.from('promos').select('*, promo_products(product_id)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('name'),
    ])
    type RawPromo = Promo & { promo_products?: { product_id: string }[] }
    const mapped: PromoRow[] = ((promoData as unknown as RawPromo[]) ?? []).map((p) => {
      const { promo_products, ...rest } = p
      return { ...rest, productIds: (promo_products ?? []).map((pp) => pp.product_id) }
    })
    setPromos(mapped)
    setProducts((prodData as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setPendingImg(noPendingImage)
    setError(null)
    setShowModal(true)
  }

  function openEdit(promo: PromoRow) {
    setForm({
      id: promo.id,
      title: promo.title,
      description: promo.description ?? '',
      image_path: promo.image_path,
      discount: promo.discount,
      start_at: promo.start_at ? promo.start_at.slice(0, 10) : '',
      end_at: promo.end_at ? promo.end_at.slice(0, 10) : '',
      active: promo.active,
      productIds: promo.productIds,
    })
    setPendingImg(noPendingImage)
    setError(null)
    setShowModal(true)
  }

  async function handleDelete(promo: Promo) {
    if (!confirm(`Hapus promo "${promo.title}"?`)) return
    // promo_products ikut terhapus otomatis (on delete cascade)
    const { error: delError } = await supabase.from('promos').delete().eq('id', promo.id)
    if (delError) {
      alert(`Gagal menghapus promo: ${delError.message}`)
      return
    }
    await removeStoredImage('promo-images', promo.image_path)
    loadData()
  }

  function toggleProduct(id: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id) ? f.productIds.filter((p) => p !== id) : [...f.productIds, id],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let commit: ImageCommit | null = null
    let promoRowSaved = false
    try {
      commit = await commitImage('promo-images', form.image_path, pendingImg)

      const payload = {
        title: form.title,
        description: form.description || null,
        image_path: commit.path,
        discount: form.discount,
        start_at: form.start_at || null,
        end_at: form.end_at || null,
        active: form.active,
      }

      let promoId = form.id
      if (form.id) {
        const res = await supabase.from('promos').update(payload).eq('id', form.id)
        if (res.error) throw new Error(res.error.message)
      } else {
        const res = await supabase.from('promos').insert(payload).select('id').single()
        if (res.error || !res.data) throw new Error(res.error?.message ?? 'Gagal membuat promo')
        promoId = res.data.id as string
      }

      // Baris promo sudah tersimpan dan merujuk gambar baru: gambar lama aman dihapus, rollback tidak lagi boleh dipakai.
      promoRowSaved = true
      await commit.finalize()
      setPendingImg(noPendingImage)
      setForm((f) => ({ ...f, id: promoId, image_path: commit ? commit.path : f.image_path }))

      const del = await supabase.from('promo_products').delete().eq('promo_id', promoId)
      if (del.error) throw new Error(`Promo tersimpan, tetapi produk terkait gagal diperbarui: ${del.error.message}`)
      if (form.productIds.length > 0) {
        const ins = await supabase
          .from('promo_products')
          .insert(form.productIds.map((pid) => ({ promo_id: promoId, product_id: pid })))
        if (ins.error) throw new Error(`Promo tersimpan, tetapi produk terkait gagal disimpan: ${ins.error.message}`)
      }

      setShowModal(false)
      loadData()
    } catch (err) {
      if (!promoRowSaved) await commit?.rollback()
      else loadData()
      setError(err instanceof Error ? err.message : 'Gagal menyimpan promo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Promo</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola promo dan produk yang terkait.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Promo
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : promos.length === 0 ? (
        <EmptyState title="Belum ada promo" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((promo) => {
            const active = isPromoActive(promo.start_at, promo.end_at, promo.active)
            return (
              <div key={promo.id} className="card p-5">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-display font-bold text-slate-800">{promo.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {active ? 'Tayang' : 'Nonaktif'}
                  </span>
                </div>
                {promo.description && <p className="mb-2 line-clamp-2 text-sm text-slate-500">{promo.description}</p>}
                <p className="text-xs text-slate-400">
                  {promo.start_at ? new Date(promo.start_at).toLocaleDateString('id-ID') : '-'} —{' '}
                  {promo.end_at ? new Date(promo.end_at).toLocaleDateString('id-ID') : '-'}
                </p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => openEdit(promo)} className="btn-secondary flex-1 text-xs">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(promo)} className="btn-secondary flex-1 text-xs text-rose-600">
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-scale-in sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">{form.id ? 'Edit Promo' : 'Tambah Promo'}</h2>
              <button type="button" onClick={() => { setPendingImg(noPendingImage); setShowModal(false) }} className="rounded-full p-2 hover:bg-slate-100" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <ImageUploader bucket="promo-images" currentPath={form.image_path} pending={pendingImg} onChange={setPendingImg} label="Gambar Promo" />

              <div>
                <label className="label">Judul Promo</label>
                <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Diskon (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input"
                    value={form.discount ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value ? Number(e.target.value) : null }))}
                  />
                </div>
                <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="h-4 w-4 accent-brand-500"
                  />
                  Aktif
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Mulai</label>
                  <input type="date" className="input" value={form.start_at} onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Tanggal Selesai</label>
                  <input type="date" className="input" value={form.end_at} onChange={(e) => setForm((f) => ({ ...f, end_at: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="label">Produk Terkait</label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 p-2">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p.id)}
                        onChange={() => toggleProduct(p.id)}
                        className="h-4 w-4 accent-brand-500"
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}

              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => { setPendingImg(noPendingImage); setShowModal(false) }} className="btn-secondary flex-1">
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
