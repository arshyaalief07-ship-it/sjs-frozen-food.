export type StockStatus = 'available' | 'limited' | 'out_of_stock'

export interface Category {
  id: string
  name: string
  slug: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number
  discount_price: number | null
  image_path: string | null
  stock_status: StockStatus
  active: boolean
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category | null
}

export interface Promo {
  id: string
  title: string
  description: string | null
  image_path: string | null
  discount: number | null
  start_at: string | null
  end_at: string | null
  active: boolean
  created_at: string
  updated_at: string
  products?: Product[]
}

export interface WhatsAppDestination {
  id: string
  name: string
  role: string
  phone: string
  active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface SettingsMap {
  [key: string]: string
}

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
}

export interface CartItem {
  productId: string
  name: string
  price: number
  imagePath: string | null
  quantity: number
}

export const STOCK_LABELS: Record<StockStatus, { label: string; icon: string; className: string }> = {
  available: { label: 'Tersedia', icon: '🟢', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  limited: { label: 'Stok Terbatas', icon: '🟠', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  out_of_stock: { label: 'Habis', icon: '🔴', className: 'bg-rose-50 text-rose-700 border-rose-200' },
}
