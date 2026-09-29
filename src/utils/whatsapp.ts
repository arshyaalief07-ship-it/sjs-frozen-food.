import { CartItem, WhatsAppDestination } from '@/types'
import { formatRupiah } from '@/utils/format'

interface BuildMessageArgs {
  storeName: string
  customerName: string
  notes: string
  items: CartItem[]
  subtotal: number
}

export function buildOrderMessage({ storeName, customerName, notes, items, subtotal }: BuildMessageArgs): string {
  const lines: string[] = []
  lines.push(`*Pesanan Baru - ${storeName}*`)
  lines.push('')
  lines.push(`Nama: ${customerName}`)
  lines.push('')
  lines.push('Detail Pesanan:')
  items.forEach((item, idx) => {
    const lineTotal = item.price * item.quantity
    lines.push(`${idx + 1}. ${item.name}`)
    lines.push(`   ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(lineTotal)}`)
  })
  lines.push('')
  lines.push(`Subtotal: ${formatRupiah(subtotal)}`)
  if (notes.trim()) {
    lines.push('')
    lines.push(`Catatan: ${notes.trim()}`)
  }
  lines.push('')
  lines.push('Mohon konfirmasi ketersediaan produk. Terima kasih! 🙏')
  return lines.join('\n')
}

export function whatsappUrl(destination: WhatsAppDestination, message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${destination.phone}?text=${encoded}`
}

export function whatsappUrlByPhone(phone: string, message = ''): string {
  const encoded = encodeURIComponent(message)
  return message ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/${phone}`
}
