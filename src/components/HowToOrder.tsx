import { ShoppingBasket, ShoppingCart, ClipboardCheck, MessageCircle, PartyPopper } from 'lucide-react'
import { SettingsMap } from '@/types'

const STEPS = [
  { title: 'Pilih Produk', icon: ShoppingBasket },
  { title: 'Masukkan Keranjang', icon: ShoppingCart },
  { title: 'Checkout', icon: ClipboardCheck },
  { title: 'Pilih WhatsApp', icon: MessageCircle },
  { title: 'Pesanan Terkirim', icon: PartyPopper },
]

export default function HowToOrder({ settings }: { settings: SettingsMap }) {
  return (
    <section className="container-app py-14">
      <h2 className="section-title reveal text-center">{settings.how_to_order_title}</h2>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STEPS.map((step, idx) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="reveal flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-card transition-transform hover:-translate-y-1"
              style={{ '--reveal-delay': `${idx * 80}ms` } as React.CSSProperties}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-bold text-brand-400">Langkah {idx + 1}</span>
              <p className="text-sm font-semibold text-slate-700">{step.title}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
