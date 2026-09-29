import { Snowflake, PackageX, AlertTriangle } from 'lucide-react'

export function Loading({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <Snowflake className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 px-6 text-center">
      <PackageX className="h-10 w-10 text-brand-300" aria-hidden />
      <p className="font-semibold text-slate-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
    </div>
  )
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 py-12 px-6 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-400" aria-hidden />
      <p className="font-semibold text-rose-700">Terjadi kesalahan</p>
      <p className="max-w-sm text-sm text-rose-500">{message}</p>
    </div>
  )
}
