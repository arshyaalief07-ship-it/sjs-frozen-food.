import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { WhatsAppDestination } from '@/types'

export function useWhatsAppDestinations(opts: { onlyActive?: boolean } = { onlyActive: true }) {
  const [destinations, setDestinations] = useState<WhatsAppDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase.from('whatsapp_destinations').select('*').order('created_at', { ascending: true })
    if (opts.onlyActive) query = query.eq('active', true)
    const { data, error: err } = await query
    if (err) setError(err.message)
    setDestinations((data as WhatsAppDestination[]) ?? [])
    setLoading(false)
  }, [opts.onlyActive])

  useEffect(() => {
    refetch()
  }, [refetch])

  const defaultDestination = destinations.find((d) => d.is_default) ?? destinations[0] ?? null

  return { destinations, defaultDestination, loading, error, refetch }
}
