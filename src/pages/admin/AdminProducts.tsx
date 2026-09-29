import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { supabase, publicImageUrl } from '@/lib/supabaseClient'
import { Product, Category, StockStatus } from '@/types'
import { formatRupiah } from '@/utils/format'
import { slugify } from '@/utils/format'
import { Loading, EmptyState } from '@/components/Feedback'
import ImageUploader from '@/components/ImageUploader'
import { commitImage, removeStoredImage, noPendingImage, PendingImage, ImageCommit } from '@/lib/storage'
import StockBadge from '@/components/StockBadge'

const emptyForm = {
  id: '',
  name: '',
  category_id: '',
  description: '',
  price: 0,
  discount_price: null as number | null,
  image_path: null as string | null,
  stock_status: 'available' as StockStatus,
  active: true,
  featured: false,
  sort_order: 0,
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [pendingImg, setPendingImg] = useState<PendingImage>(noPendingImage)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*, category:categories(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setProducts((prods as Product[]) ?? [])
    setCategories((cats as Category[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    setForm({ ...emptyForm, category_id: categories[0]?.id ?? '', sort_order: products.reduce((m, p) => Math.max(m, p.sort_order), 0) + 1 })
    setPendingImg(noPendingImage)
    setError(null)
    setShowModal(true)
  }

  function openEdit(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      category_id: product.category_id ?? '',
      description: product.description ?? '',
      price: product.price,
      discount_price: product.discount_price,
      image_path: product.image_path,
      stock_status: product.stock_status,
      active: product.active,
      featured: product.featured,
      sort_order: product.sort_order,
    })
    setPendingImg(noPendingImage)
    setError(null)
    setShowModal(true)
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return
    const { error: delError } = await supabase.from('products').delete().eq('id', product.id)
    if (delError) {
      alert(`Gagal menghapus produk: ${delError.message}`)
      return
    }
    await removeStoredImage('product-images', product.image_path)
    loadData()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    let commit: ImageCommit | null = null
    try {
      // 1) unggah gambar baru (bila ada) -> 2) tulis DB -> 3a) sukses: hapus gambar lama | 3b) gagal: hapus gambar baru
      commit = await commitImage('product-images', form.image_path, pendingImg)

      const base = {
        name: form.name,
        category_id: form.category_id || null,
        description: form.description || null,
        price: form.price,
        discount_price: form.discount_price,
        image_path: commit.path,
        stock_status: form.stock_status,
        active: form.active,
        featured: form.featured,
        sort_order: form.sort_order,
      }

      const res = form.id
        ? await supabase.from('products').update(base).eq('id', form.id)
        : await supabase
            .from('products')
            .insert({ ...base, slug: `${slugify(form.name) || 'produk'}-${Date.now().toString(36)}` })
      if (res.error) throw new Error(res.error.message)

      await commit.finalize()
      setPendingImg(noPendingImage)
      setShowModal(false)
      loadData()
    } catch (err) {
      await commit?.rollback()
      setError(err instanceof Error ? err.message : 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Produk</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola produk, harga, dan status stok.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Produk
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <EmptyState title="Belum ada produk" description="Tambahkan produk pertama Anda." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const imgUrl = publicImageUrl('product-images', p.image_path)
                return (
                  <tr key={p.id}>
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-brand-50">
                        {imgUrl ? <img src={imgUrl} className="h-full w-full object-cover" alt="" /> : null}
                      </div>
                      <span className="font-medium text-slate-800">{p.name}</span>
                      {p.featured && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Unggulan</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category?.name ?? '-'}</td>
                    <td className="px-4 py-3">
                      {p.discount_price ? (
                        <>
                          <span className="font-semibold text-brand-700">{formatRupiah(p.discount_price)}</span>{' '}
                          <span className="text-xs text-slate-400 line-through">{formatRupiah(p.price)}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-slate-700">{formatRupiah(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge status={p.stock_status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(p)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(p)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50" aria-label="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-scale-in sm:rounded-3xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">{form.id ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button type="button" onClick={() => { setPendingImg(noPendingImage); setShowModal(false) }} className="rounded-full p-2 hover:bg-slate-100" aria-label="Tutup">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <ImageUploader bucket="product-images" currentPath={form.image_path} pending={pendingImg} onChange={setPendingImg} label="Foto Produk" />

              <div>
                <label className="label">Nama Produk</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Kategori</label>
                <select
                  className="input"
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                >
                  <option value="">Tanpa kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Harga (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="label">Harga Diskon (opsional)</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={form.discount_price ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, discount_price: e.target.value ? Number(e.target.value) : null }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">Status Stok</label>
                <select
                  className="input"
                  value={form.stock_status}
                  onChange={(e) => setForm((f) => ({ ...f, stock_status: e.target.value as StockStatus }))}
                >
                  <option value="available">🟢 Tersedia</option>
                  <option value="limited">🟠 Stok Terbatas</option>
                  <option value="out_of_stock">🔴 Habis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Urutan Tampil</label>
                  <input
                    type="number"
                    className="input"
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      className="h-4 w-4 accent-brand-500"
                    />
                    Aktif (tampil di website)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                      className="h-4 w-4 accent-brand-500"
                    />
                    Produk Unggulan
                  </label>
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
