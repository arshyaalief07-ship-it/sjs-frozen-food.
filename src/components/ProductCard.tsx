import { Link } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { Product } from '@/types'
import { publicImageUrl } from '@/lib/supabaseClient'
import { formatRupiah } from '@/utils/format'
import { useCart } from '@/context/CartContext'
import StockBadge from '@/components/StockBadge'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, lastAdded } = useCart()
  const imageUrl = publicImageUrl('product-images', product.image_path)
  const hasDiscount = product.discount_price != null && product.discount_price < product.price
  const outOfStock = product.stock_status === 'out_of_stock'
  const justAdded = lastAdded === product.id

  return (
    <div className="group card reveal flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/produk/${product.id}`} className="relative block aspect-square overflow-hidden bg-brand-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🧊</div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white shadow">
            DISKON
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {product.category.name}
          </span>
        )}
        <Link to={`/produk/${product.id}`}>
          <h3 className="line-clamp-2 font-display font-semibold text-slate-900 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="font-display text-lg font-bold text-brand-700">
                {formatRupiah(product.discount_price as number)}
              </span>
              <span className="text-sm text-slate-400 line-through">{formatRupiah(product.price)}</span>
            </>
          ) : (
            <span className="font-display text-lg font-bold text-brand-700">{formatRupiah(product.price)}</span>
          )}
        </div>
        <StockBadge status={product.stock_status} />
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => addItem(product)}
          className={`btn mt-auto w-full ${outOfStock ? 'btn-secondary cursor-not-allowed' : 'btn-primary'}`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Ditambahkan
            </>
          ) : outOfStock ? (
            'Stok Habis'
          ) : (
            <>
              <Plus className="h-4 w-4" /> Tambah
            </>
          )}
        </button>
      </div>
    </div>
  )
}
