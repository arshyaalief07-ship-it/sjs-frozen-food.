import { usePromos } from '@/hooks/usePromos'
import PromoCard from '@/components/PromoCard'
import { useSettings } from '@/hooks/useSettings'
import { Loading, EmptyState, ErrorState } from '@/components/Feedback'

export default function PromoPage() {
  const { promos, loading, error } = usePromos({ onlyActive: true })
  const { settings } = useSettings()

  return (
    <div className="container-app py-10">
      <h1 className="section-title reveal">{settings.promo_section_title}</h1>
      <p className="mt-1 text-sm text-slate-500">Jangan sampai kelewatan penawaran spesial dari {settings.site_name}.</p>

      <div className="mt-8">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : promos.length === 0 ? (
          <EmptyState title="Belum ada promo aktif saat ini" description="Nantikan promo menarik dari SJS Frozen Food segera!" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {promos.map((promo) => (
              <PromoCard key={promo.id} promo={promo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
