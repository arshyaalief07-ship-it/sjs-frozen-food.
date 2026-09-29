import { useEffect } from 'react'

/**
 * Animasi muncul saat di-scroll memakai satu IntersectionObserver untuk seluruh elemen `.reveal`.
 * Elemen yang dirender belakangan (data async / pindah halaman) ditangkap lewat MutationObserver.
 * Bila prefers-reduced-motion aktif, class `reveal-ready` tidak dipasang (lihat main.tsx),
 * sehingga semua konten langsung tampil tanpa animasi.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains('reveal-ready') || !('IntersectionObserver' in window)) {
      root.classList.remove('reveal-ready')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const observeWithin = (node: ParentNode) => {
      node.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el))
    }
    observeWithin(document)

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            if (n.matches('.reveal:not(.is-visible)')) io.observe(n)
            observeWithin(n)
          }
        })
      )
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return null
}
