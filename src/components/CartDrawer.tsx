import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { publicImageUrl } from '@/lib/supabaseClient'
import { formatRupiah } from '@/utils/format'

export default function CartDrawer() {
  const { items, isOpen, closeCart, increment, decrement, removeItem, subtotal } = useCart()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Keranjang Belanja</h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400">
              <ShoppingBag className="h-10 w-10" />
              <p className="font-medium">Keranjang masih kosong</p>
              <Link to="/produk" onClick={closeCart} className="btn-primary mt-2">
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => {
                const imageUrl = publicImageUrl('product-images', item.imagePath)
                return (
                  <li key={item.productId} className="flex animate-scale-in gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🧊</div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm font-bold text-brand-700">{formatRupiah(item.price)}</p>
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrement(item.productId)}
                          className="rounded-full border border-slate-200 p-1 hover:bg-slate-50"
                          aria-label={`Kurangi ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => increment(item.productId)}
                          className="rounded-full border border-slate-200 p-1 hover:bg-slate-50"
                          aria-label={`Tambah ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto rounded-full p-1.5 text-rose-400 hover:bg-rose-50"
                          aria-label={`Hapus ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-medium text-slate-500">Subtotal</span>
              <span className="font-display text-xl font-bold text-slate-900">{formatRupiah(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-primary w-full">
              Lanjut ke Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
