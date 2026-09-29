import { MessageCircle } from 'lucide-react'
import { WhatsAppDestination } from '@/types'
import { whatsappUrlByPhone } from '@/utils/whatsapp'

/** Tombol WhatsApp mengambang: memakai kontak default aktif dari tabel whatsapp_destinations. */
export default function WhatsAppFloat({
  destination,
  siteName,
}: {
  destination: WhatsAppDestination | null
  siteName: string
}) {
  if (!destination) return null

  return (
    <a
      href={whatsappUrlByPhone(destination.phone, `Halo ${siteName}, saya ingin bertanya tentang produk.`)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 animate-float items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft transition-transform hover:scale-105"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label={`Hubungi ${destination.name} via WhatsApp`}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  )
}
