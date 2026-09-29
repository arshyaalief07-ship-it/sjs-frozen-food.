import { StockStatus, STOCK_LABELS } from '@/types'

export default function StockBadge({ status }: { status: StockStatus }) {
  const info = STOCK_LABELS[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${info.className}`}
    >
      <span aria-hidden>{info.icon}</span>
      {info.label}
    </span>
  )
}
