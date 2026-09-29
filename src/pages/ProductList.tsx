import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import CategoryChip from '@/components/CategoryChip'
import { Loading, EmptyState, ErrorState } from '@/components/Feedback'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQ = searchParams.get('q') ?? ''
  const urlCat = searchParams.get('kategori')
  const [query, setQuery] = useState(urlQ)
  const [category, setCategory] = useState<string | null>(urlCat)
  const written = useRef({ q: urlQ, cat: urlCat })

  const { categories } = useCategories({ onlyActive: true })
  // Pencarian & filter dilakukan di klien: hasil berubah seketika saat mengetik
  const { products, loading, error } = useProducts({ onlyActive: true, search: query, categorySlug: category })

  // URL berubah dari luar (mis. pencarian di navbar) -> sinkronkan ke state
  useEffect(() => {
    if (urlQ !== written.current.q || urlCat !== written.current.cat) {
      written.current = { q: urlQ, cat: urlCat }
      setQuery(urlQ)
      setCategory(urlCat)
    }
  }, [urlQ, urlCat])

  // State berubah -> tulis ke URL (agar bisa dibagikan), ditunda sebentar
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const q = query.trim()
      if (q === written.current.q && category === written.current.cat) return
      written.current = { q, cat: category }
      const params: Record<string, string> = {}
      if (q) params.q = q
      if (category) params.kategori = category
      setSearchParams(params, { replace: true })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query, category, setSearchParams])

  function selectCategory(slug: string) {
    setCategory((prev) => (prev === slug ? null : slug))
  }

  return (
    <div className="container-app py-10">
      <h1 className="section-title reveal">Semua Produk</h1>
      <p className="mt-1 text-sm text-slate-500">Temukan frozen food favoritmu, cek harga dan ketersediaannya.</p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nugget, sosis, bakso, udang..."
            className="input pl-10 pr-10"
            aria-label="Cari produk"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
              aria-label="Bersihkan pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              active={category === cat.slug}
              onClick={() => selectCategory(cat.slug)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Produk tidak ditemukan"
            description={query.trim() ? `Tidak ada hasil untuk "${query.trim()}".` : 'Belum ada produk pada kategori ini.'}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
