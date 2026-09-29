import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X, Undo2 } from 'lucide-react'
import { publicImageUrl } from '@/lib/supabaseClient'
import { PendingImage, validateImage } from '@/lib/storage'

/**
 * Pemilih gambar dengan preview lokal. TIDAK mengunggah apa pun ke Storage;
 * file baru diunggah oleh commitImage() saat form disimpan.
 */
export default function ImageUploader({
  bucket,
  currentPath,
  pending,
  onChange,
  label = 'Gambar',
  hint,
}: {
  bucket: string
  currentPath: string | null
  pending: PendingImage
  onChange: (next: PendingImage) => void
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const localUrl = useMemo(() => (pending.file ? URL.createObjectURL(pending.file) : null), [pending.file])
  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl)
    }
  }, [localUrl])

  const previewUrl = localUrl ?? (pending.removed ? null : publicImageUrl(bucket, currentPath))

  function handleFile(file: File) {
    const problem = validateImage(file)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    onChange({ file, removed: false })
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {previewUrl ? (
            <img src={previewUrl} alt={`Pratinjau ${label}`} className="h-full w-full object-contain" />
          ) : (
            <Upload className="h-6 w-6 text-slate-300" aria-hidden />
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.ico"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
              e.target.value = ''
            }}
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary text-xs">
            <Upload className="h-3.5 w-3.5" /> {currentPath || pending.file ? 'Ganti Gambar' : 'Pilih Gambar'}
          </button>
          {pending.file && (
            <button
              type="button"
              onClick={() => onChange({ file: null, removed: false })}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:underline"
            >
              <Undo2 className="h-3 w-3" /> Batalkan gambar baru
            </button>
          )}
          {!pending.file && !pending.removed && currentPath && (
            <button
              type="button"
              onClick={() => onChange({ file: null, removed: true })}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 hover:underline"
            >
              <X className="h-3 w-3" /> Hapus gambar
            </button>
          )}
          {pending.removed && (
            <button
              type="button"
              onClick={() => onChange({ file: null, removed: false })}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:underline"
            >
              <Undo2 className="h-3 w-3" /> Batalkan hapus
            </button>
          )}
        </div>
      </div>
      {(pending.file || pending.removed) && (
        <p className="mt-1 text-xs text-amber-600">Perubahan gambar baru diterapkan setelah menekan Simpan.</p>
      )}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
