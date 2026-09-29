export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isPromoActive(startAt: string | null, endAt: string | null, active: boolean): boolean {
  if (!active) return false
  const now = new Date()
  if (startAt && new Date(startAt) > now) return false
  if (endAt && new Date(endAt) < now) return false
  return true
}
