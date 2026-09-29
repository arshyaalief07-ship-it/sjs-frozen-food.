import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Product, Promo } from '@/types'
import { isPromoActive } from '@/utils/format'

type RawPromo = Omit<Promo, 'products'> & {
  promo_products: { product: Product | null }[] | null
}

export function usePromos(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const { onlyActive } = opts
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('promos')
      .select('*, promo_products(product:products(*))')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setPromos([])
      setLoading(false)
      return
    }

    let result: Promo[] = ((data as unknown as RawPromo[]) ?? []).map((p) => {
      const { promo_products, ...rest } = p
      return {
        ...rest,
        // RLS sudah menyembunyikan produk nonaktif; filter tambahan untuk keamanan tampilan
        products: (promo_products ?? []).map((pp) => pp.product).filter((x): x is Product => !!x && x.active),
      }
    })

    // Promo kedaluwarsa / belum mulai / nonaktif otomatis tidak tampil ke publik
    if (onlyActive) result = result.filter((p) => isPromoActive(p.start_at, p.end_at, p.active))

    setPromos(result)
    setLoading(false)
  }, [onlyActive])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { promos, loading, error, refetch }
}
