import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWhatsAppDestinations } from '@/hooks/useWhatsAppDestinations'
import { useSettings } from '@/hooks/useSettings'
import { publicImageUrl } from '@/lib/supabaseClient'
import { formatRupiah } from '@/utils/format'
import { buildOrderMessage, whatsappUrl } from '@/utils/whatsapp'
import { Loading, EmptyState } from '@/components/Feedback'

export default function Checkout() {
  const { items, increment, decrement, removeItem, subtotal, clearCart } = useCart()
  const { destinations, defaultDestination, loading } = useWhatsAppDestinations({ onlyActive: true })
  const navigate = useNavigate()
  const { settings } = useSettings()

  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [waLink, setWaLink] = useState<string | null>(null)

  const activeDestId = selectedDestId ?? defaultDestination?.id ?? null

  if (items.length === 0 && !sent) {
    return (
      <div className="container-app py-16">
        <EmptyState title="Keranjang masih kosong" description="Tambahkan produk terlebih dahulu sebelum checkout." />
        <div className="mt-6 text-center">
          <Link to="/produk" className="btn-primary">
            <ShoppingBag className="h-4 w-4" /> Belanja Sekarang
          </Link>
        </div>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setNameError('Nama wajib diisi.')
      return
    }
    const destination = destinations.find((d) => d.id === activeDestId)
    if (!destination) return

    const message = buildOrderMessage({ storeName: settings.site_name, customerName: name.trim(), notes, items, subtotal })
    const url = whatsappUrl(destination, message)
    window.open(url, '_blank', 'noopener,noreferrer')
    setWaLink(url)
    setSent(true)
    clearCart()
  }

  if (sent) {
    return (
      <div className="container-app flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">G£à</span>
        <h1 className="font-display text-2xl font-bold text-slate-900">Pesanan siap dikirim ke WhatsApp!</h1>
        <p className="max-w-sm text-sm text-slate-500">
          Jika WhatsApp belum terbuka otomatis, periksa pop-up blocker di browser Anda.
        </p>
        {waLink && (
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <MessageCircle className="h-4 w-4" /> Buka WhatsApp Lagi
          </a>
        )}
        <button type="button" onClick={() => navigate('/produk')} className="btn-secondary">
          Belanja Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="container-app py-10">
      <h1 className="section-title reveal">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {items.map((item) => {
                const imageUrl = publicImageUrl('product-images', item.imagePath)
                return (
                  <li key={item.productId} className="flex gap-3 p-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">=ƒºè</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm font-bold text-brand-700">{formatRupiah(item.price)}</p>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrement(item.productId)}
                          className="rounded-full border border-slate-200 p-1 hover:bg-slate-50"
                          aria-label="Kurangi"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.productId)}
                          className="rounded-full border border-slate-200 p-1 hover:bg-slate-50"
                          aria-label="Tambah"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto rounded-full p-1.5 text-rose-400 hover:bg-rose-50"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-slate-700">{formatRupiah(item.price * item.quantity)}</p>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-100 p-4">
              <span className="font-medium text-slate-500">Subtotal</span>
              <span className="font-display text-xl font-bold text-slate-900">{formatRupiah(subtotal)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card h-fit p-5">
          <h2 className="mb-4 font-display font-bold text-slate-800">Detail Pesanan</h2>

          <div className="mb-4">
            <label className="label" htmlFor="name">
              Nama <span className="text-rose-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setNameError(null)
              }}
              placeholder="Nama Anda"
              className="input"
              required
            />
            {nameError && <p className="mt-1 text-xs font-medium text-rose-500">{nameError}</p>}
          </div>

          <div className="mb-5">
            <label className="label" htmlFor="notes">
              Catatan (opsional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: tolong pedas levelnya sedang"
              rows={3}
              className="input resize-none"
            />
          </div>

          <div className="mb-5">
            <span className="label">Kirim pesanan ke</span>
            {loading ? (
              <Loading label="Memuat kontak WhatsApp..." />
            ) : (
              <div className="flex flex-col gap-2">
                {destinations.map((dest) => (
                  <label
                    key={dest.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      activeDestId === dest.id ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="destination"
                      value={dest.id}
                      checked={activeDestId === dest.id}
                      onChange={() => setSelectedDestId(dest.id)}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-slate-800">{dest.name}</span>
                      <span className="block text-xs text-slate-500">{dest.role}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-whatsapp w-full" disabled={!activeDestId}>
            <MessageCircle className="h-4 w-4" /> Kirim Pesanan ke WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
