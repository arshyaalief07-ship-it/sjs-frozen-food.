import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Tags, Sparkles, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ products: 0, categories: 0, promos: 0, whatsapp: 0 })

  useEffect(() => {
    async function loadCounts() {
      const [products, categories, promos, whatsapp] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('promos').select('*', { count: 'exact', head: true }),
        supabase.from('whatsapp_destinations').select('*', { count: 'exact', head: true }),
      ])
      setCounts({
        products: products.count ?? 0,
        categories: categories.count ?? 0,
        promos: promos.count ?? 0,
        whatsapp: whatsapp.count ?? 0,
      })
    }
    loadCounts()
  }, [])

  const cards = [
    { label: 'Produk', value: counts.products, icon: Package, to: '/admin/products', color: 'bg-brand-500' },
    { label: 'Kategori', value: counts.categories, icon: Tags, to: '/admin/categories', color: 'bg-emerald-500' },
    { label: 'Promo', value: counts.promos, icon: Sparkles, to: '/admin/promos', color: 'bg-rose-500' },
    { label: 'Kontak WhatsApp', value: counts.whatsapp, icon: Phone, to: '/admin/whatsapp', color: 'bg-amber-500' },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Ringkasan data website SJS Frozen Food.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.label} to={card.to} className="card flex items-center gap-4 p-5 transition-transform hover:-translate-y-1">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${card.color}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500">{card.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-display font-bold text-slate-800">Mulai Cepat</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Kelola produk dan stok di menu <strong>Produk</strong>.</li>
          <li>Atur kategori tampil di homepage lewat menu <strong>Kategori</strong>.</li>
          <li>Buat promo menarik lewat menu <strong>Promo</strong>.</li>
          <li>Atur nomor WhatsApp tujuan pesanan di menu <strong>WhatsApp</strong>.</li>
          <li>Ubah tampilan hero & teks homepage di menu <strong>Website</strong>.</li>
        </ul>
      </div>
    </div>
  )
}
