import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Promo } from '@/types'
import { publicImageUrl } from '@/lib/supabaseClient'

export default function PromoCard({ promo }: { promo: Promo }) {
  const imageUrl = publicImageUrl('promo-images', promo.image_path)
  const firstProduct = promo.products?.[0]
  const linkTo = firstProduct ? `/produk/${firstProduct.id}` : '/promo'

  return (
    <Link
      to={linkTo}
      className="reveal group relative flex min-w-[280px] flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-1 shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:min-w-[340px]"
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-[1.35rem] bg-brand-700/40 sm:flex-row">
        <div className="relative flex-1 p-6 text-white">
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> PROMO
          </span>
          <h3 className="font-display text-xl font-bold sm:text-2xl">{promo.title}</h3>
          {promo.description && (
            <p className="mt-2 line-clamp-2 text-sm text-white/85">{promo.description}</p>
          )}
          {promo.discount != null && (
            <p className="mt-3 font-display text-3xl font-extrabold">
              -{promo.discount}%
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white group-hover:gap-2 transition-all">
            Lihat Penawaran <ArrowRight className="h-4 w-4" />
          </span>
        </div>
        {imageUrl && (
          <div className="relative h-40 w-full overflow-hidden sm:h-auto sm:w-40">
            <img
              src={imageUrl}
              alt={promo.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}
      </div>
    </Link>
  )
}
