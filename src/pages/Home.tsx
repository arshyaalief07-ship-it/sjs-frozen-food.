import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Hero from '@/components/Hero'
import HowToOrder from '@/components/HowToOrder'
import LocationSection from '@/components/LocationSection'
import ProductCard from '@/components/ProductCard'
import PromoCard from '@/components/PromoCard'
import CategoryChip from '@/components/CategoryChip'
import { Loading, EmptyState, ErrorState } from '@/components/Feedback'
import { useProducts } from '@/hooks/useProducts'
import { usePromos } from '@/hooks/usePromos'
import { useCategories } from '@/hooks/useCategories'
import { SettingsMap } from '@/types'

export default function Home({ settings }: { settings: SettingsMap }) {
  const { promos, loading: promosLoading } = usePromos({ onlyActive: true })
  const { categories, loading: catsLoading } = useCategories({ onlyActive: true })
  const { products: allProducts, loading: featuredLoading, error: prodError } = useProducts({ onlyActive: true })

  const flagged = allProducts.filter((p) => p.featured)
  const featured = (flagged.length > 0 ? flagged : allProducts).slice(0, 8)

  return (
    <div>
      <Hero settings={settings} />

      {/* Promo section */}
      <section className="container-app py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title reveal">{settings.promo_section_title}</h2>
          <Link to="/promo" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 sm:flex">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {promosLoading ? (
          <Loading />
        ) : promos.length === 0 ? (
          <EmptyState title="Belum ada promo aktif" description="Nantikan promo menarik dari SJS Frozen Food segera!" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin sm:grid sm:grid-cols-2">
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}
      </section>

      {/* Category section */}
      <section className="container-app py-6">
        <h2 className="section-title reveal mb-8">{settings.category_section_title}</h2>
        {catsLoading ? (
          <Loading />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map((cat) => (
              <CategoryChip key={cat.id} category={cat} to={`/produk?kategori=${cat.slug}`} />
            ))}
          </div>
        )}
      </section>

      {/* Product catalog / featured */}
      <section className="container-app py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-title reveal">{settings.featured_section_title}</h2>
          <Link to="/produk" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 sm:flex">
            Lihat Semua <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featuredLoading ? (
          <Loading />
        ) : prodError ? (
          <ErrorState message={prodError} />
        ) : featured.length === 0 ? (
          <EmptyState title="Belum ada produk" description="Produk akan segera tersedia." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link to="/produk" className="btn-secondary">
            Lihat Semua Produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <HowToOrder settings={settings} />
      <LocationSection settings={settings} />
    </div>
  )
}
