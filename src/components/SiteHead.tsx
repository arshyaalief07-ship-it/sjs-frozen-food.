import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'
import { publicImageUrl } from '@/lib/supabaseClient'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Menerapkan favicon, title, dan meta SEO dari tabel settings (Supabase). */
export default function SiteHead() {
  const { settings } = useSettings()
  const { pathname } = useLocation()
  const originalIcon = useRef<{ href: string | null; type: string | null } | null>(null)

  // Favicon dari Supabase Storage; bila dihapus, kembali ke favicon bawaan
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    if (!originalIcon.current) {
      originalIcon.current = { href: link.getAttribute('href'), type: link.getAttribute('type') }
    }
    const url = publicImageUrl('site-images', settings.favicon_path)
    if (url) {
      link.removeAttribute('type')
      link.href = url
    } else if (originalIcon.current.href) {
      link.href = originalIcon.current.href
      if (originalIcon.current.type) link.type = originalIcon.current.type
    }
  }, [settings.favicon_path])

  // Title & meta. Halaman detail produk mengatur title-nya sendiri.
  useEffect(() => {
    const isProductDetail = /^\/produk\/[^/]+/.test(pathname)
    if (pathname.startsWith('/admin')) {
      document.title = `Admin | ${settings.site_name}`
    } else if (!isProductDetail) {
      document.title = settings.seo_title
    }
    setMeta('meta[name="description"]', 'name', 'description', settings.seo_description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', settings.seo_title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', settings.seo_description)
  }, [pathname, settings.seo_title, settings.seo_description, settings.site_name])

  return null
}
