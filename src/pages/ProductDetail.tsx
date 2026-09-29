import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, ChevronLeft } from 'lucide-react'
import { Product } from '@/types'
import { fetchProductById } from '@/hooks/useProducts'
import { publicImageUrl } from '@/lib/supabaseClient'
import { formatRupiah } from '@/utils/format'
import { useCart } from '@/context/CartContext'
import { useSettings } from '@/hooks/useSettings'
import StockBadge from '@/components/StockBadge'
import { Loading, EmptyState } from '@/components/Feedback'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCart()
  const { settings } = useSettings()

  useEffect(() => {
    let active = true
    setLoading(true)
    if (id) {
      fetchProductById(id).then((data) => {
        if (active) {
          setProduct(data)
          setLoading(false)
        }
      })
    }
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (product) document.title = `${product.name} | ${settings.site_name}`
  }, [product, settings.site_name])

  if (loading) return <Loading label="Memuat produk..." />
  if (!product) {
    return (
      <div className="container-app py-10">
        <EmptyState title="Produk tidak ditemukan" description="Produk mungkin sudah tidak tersedia." />
        <div className="mt-6 text-center">
          <Link to="/produk" className="btn-secondary">
            Kembali ke Produk
          </Link>
        </div>
      </div>
    )
  }

  const imageUrl = publicImageUrl('product-images', product.image_path)
  const hasDiscount = product.discount_price != null && product.discount_price < product.price
  const outOfStock = product.stock_status === 'out_of_stock'

  function handleAddToCart() {
    if (product) addItem(product, quantity)
  }

  function handleBuyNow() {
    if (product) {
      addItem(product, quantity)
      navigate('/checkout')
    }
  }

  return (
    <div className="container-app reveal py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        <ChevronLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl bg-brand-50">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl">🧊</div>
          )}
        </div>

        <div>
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-brand-500">{product.category.name}</span>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="font-display text-2xl font-bold text-brand-700">
                  {formatRupiah(product.discount_price as number)}
                </span>
                <span className="text-lg text-slate-400 line-through">{formatRupiah(product.price)}</span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">
                  Hemat {Math.round((1 - (product.discount_price as number) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="font-display text-2xl font-bold text-brand-700">{formatRupiah(product.price)}</span>
            )}
          </div>

          <div className="mt-4">
            <StockBadge status={product.stock_status} />
          </div>

          {product.description && <p className="mt-5 text-sm leading-relaxed text-slate-600">{product.description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <span className="label mb-0">Jumlah</span>
            <div className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="rounded-full p-1 hover:bg-slate-100"
                aria-label="Kurangi jumlah"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="rounded-full p-1 hover:bg-slate-100"
                aria-label="Tambah jumlah"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleAddToCart}
              className={`btn flex-1 ${outOfStock ? 'btn-secondary cursor-not-allowed' : 'btn-secondary'}`}
            >
              <ShoppingCart className="h-4 w-4" /> Tambah Keranjang
            </button>
            <button
              type="button"
              disabled={outOfStock}
              onClick={handleBuyNow}
              className={`btn flex-1 ${outOfStock ? 'btn-secondary cursor-not-allowed' : 'btn-primary'}`}
            >
              {outOfStock ? 'Stok Habis' : 'Beli Sekarang'}
            </button>
          </div>
          <button type="button" onClick={openCart} className="mt-3 text-xs font-medium text-brand-600 underline">
            Lihat keranjang
          </button>
        </div>
      </div>
    </div>
  )
}
