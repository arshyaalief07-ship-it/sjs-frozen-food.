import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import { SettingsProvider, useSettings } from '@/hooks/useSettings'
import { useWhatsAppDestinations } from '@/hooks/useWhatsAppDestinations'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminLayout from '@/components/AdminLayout'
import ScrollReveal from '@/components/ScrollReveal'
import SiteHead from '@/components/SiteHead'

import Home from '@/pages/Home'
import ProductList from '@/pages/ProductList'
import ProductDetail from '@/pages/ProductDetail'
import PromoPage from '@/pages/Promo'
import Checkout from '@/pages/Checkout'

import AdminLogin from '@/pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminPromos from '@/pages/admin/AdminPromos'
import AdminWhatsApp from '@/pages/admin/AdminWhatsApp'
import AdminWebsite from '@/pages/admin/AdminWebsite'
import AdminSettings from '@/pages/admin/AdminSettings'

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  // Satu sumber data: tabel whatsapp_destinations. Navbar & tombol mengambang memakai kontak default aktif.
  const { destinations, defaultDestination } = useWhatsAppDestinations({ onlyActive: true })
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (hash) {
      const t = window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 100)
      return () => window.clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [hash, pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar settings={settings} whatsapp={defaultDestination} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} destinations={destinations} />
      <CartDrawer />
      <WhatsAppFloat destination={defaultDestination} siteName={settings.site_name} />
    </div>
  )
}

function HomeWithSettings() {
  const { settings } = useSettings()
  return <Home settings={settings} />
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <SiteHead />
          <ScrollReveal />
          <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promos"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminPromos />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/whatsapp"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminWhatsApp />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/website"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminWebsite />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <CustomerLayout>
                <HomeWithSettings />
              </CustomerLayout>
            }
          />
          <Route
            path="/produk"
            element={
              <CustomerLayout>
                <ProductList />
              </CustomerLayout>
            }
          />
          <Route
            path="/produk/:id"
            element={
              <CustomerLayout>
                <ProductDetail />
              </CustomerLayout>
            }
          />
          <Route
            path="/promo"
            element={
              <CustomerLayout>
                <PromoPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <Checkout />
              </CustomerLayout>
            }
          />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  )
}
