import { useEffect, useState } from 'react'
import { Snowflake } from 'lucide-react'
import { SettingsMap } from '@/types'
import { publicImageUrl } from '@/lib/supabaseClient'

/** Logo dari Supabase (site-images). Tanpa logo / gagal dimuat -> fallback lencana SJS + nama. */
export default function BrandLogo({
  settings,
  nameClassName = '',
}: {
  settings: SettingsMap
  nameClassName?: string
}) {
  const url = publicImageUrl('site-images', settings.logo_path)
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [url])

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={settings.site_name}
        onError={() => setFailed(true)}
        className="h-9 w-auto max-w-[160px] object-contain"
      />
    )
  }

  return (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white shadow-soft">
        <Snowflake className="h-5 w-5" />
      </span>
      <span className={nameClassName}>{settings.site_name}</span>
    </>
  )
}
