import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Category } from '@/types'

export function useCategories(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('categories').select('*').order('sort_order', { ascending: true })
    if (opts.onlyActive) query = query.eq('active', true)
    const { data, error: err } = await query
    if (err) setError(err.message)
    setCategories((data as Category[]) ?? [])
    setLoading(false)
  }, [opts.onlyActive])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { categories, loading, error, refetch }
}
