import { useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Product } from '@/types'

interface UseProductsOptions {
  onlyActive?: boolean
  categorySlug?: string | null
  search?: string
  featuredOnly?: boolean
}

/**
 * Data diambil sekali dari Supabase (katalog toko kecil), lalu pencarian & filter kategori
 * dilakukan di klien sehingga hasil langsung berubah saat mengetik.
 * Pencarian mencocokkan nama, deskripsi, dan nama kategori (semua kata harus cocok).
 */
export function useProducts(opts: UseProductsOptions = {}) {
  const { onlyActive = true, categorySlug, search, featuredOnly } = opts
  const [all, setAll] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('sort_order', { ascending: true })
    if (onlyActive) query = query.eq('active', true)
    if (featuredOnly) query = query.eq('featured', true)
    const { data, error: err } = await query
    if (err) {
      setError(err.message)
      setAll([])
    } else {
      setAll((data as Product[]) ?? [])
    }
    setLoading(false)
  }, [onlyActive, featuredOnly])

  useEffect(() => {
    refetch()
  }, [refetch])

  const products = useMemo(() => {
    let result = all
    if (categorySlug) result = result.filter((p) => p.category?.slug === categorySlug)
    const tokens = (search ?? '').toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length > 0) {
      result = result.filter((p) => {
        const haystack = `${p.name} ${p.description ?? ''} ${p.category?.name ?? ''}`.toLowerCase()
        return tokens.every((t) => haystack.includes(t))
      })
    }
    return result
  }, [all, categorySlug, search])

  return { products, loading, error, refetch }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) return null
  return (data as Product | null) ?? null
}
