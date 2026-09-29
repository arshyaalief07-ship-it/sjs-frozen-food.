import { supabase } from '@/lib/supabaseClient'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
}

/** Gambar yang dipilih admin tetapi BELUM diunggah. Upload baru terjadi saat tombol Simpan ditekan. */
export interface PendingImage {
  file: File | null
  removed: boolean
}

export const noPendingImage: PendingImage = { file: null, removed: false }

export function validateImage(file: File): string | null {
  const byName = file.name.toLowerCase().endsWith('.ico')
  if (!EXT_BY_TYPE[file.type] && !byName) {
    return 'Format tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, atau ICO.'
  }
  if (file.size > MAX_IMAGE_BYTES) return 'Ukuran gambar maksimal 5 MB.'
  return null
}

function safePath(file: File): string {
  const ext = EXT_BY_TYPE[file.type] ?? (file.name.toLowerCase().endsWith('.ico') ? 'ico' : 'bin')
  return `${Date.now()}-${crypto.randomUUID()}.${ext}`
}

function isStoragePath(path: string | null): path is string {
  return !!path && !path.startsWith('http')
}

export interface ImageCommit {
  /** Path yang harus disimpan ke database (null = tanpa gambar). */
  path: string | null
  /** Panggil jika penyimpanan database GAGAL: menghapus file baru agar tidak yatim. */
  rollback: () => Promise<void>
  /** Panggil setelah database BERHASIL: menghapus gambar lama yang sudah tidak dipakai. */
  finalize: () => Promise<void>
}

/**
 * Langkah 1 dari penyimpanan: unggah file baru (jika ada) dan tentukan path final.
 * Pemakaian:
 *   const c = await commitImage(...)
 *   tulis DB dengan c.path  -> sukses: await c.finalize() | gagal: await c.rollback()
 */
export async function commitImage(
  bucket: string,
  currentPath: string | null,
  pending: PendingImage
): Promise<ImageCommit> {
  const noop = async () => {}

  if (!pending.file && !pending.removed) {
    return { path: currentPath, rollback: noop, finalize: noop }
  }

  const removeOld = async () => {
    if (!isStoragePath(currentPath)) return
    try {
      await supabase.storage.from(bucket).remove([currentPath])
    } catch {
      // gagal hapus file lama tidak boleh membatalkan penyimpanan
    }
  }

  if (pending.file) {
    const newPath = safePath(pending.file)
    const { error } = await supabase.storage.from(bucket).upload(newPath, pending.file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: pending.file.type || undefined,
    })
    if (error) throw new Error(`Gagal mengunggah gambar: ${error.message}`)
    return {
      path: newPath,
      rollback: async () => {
        try {
          await supabase.storage.from(bucket).remove([newPath])
        } catch {
          // abaikan
        }
      },
      finalize: removeOld,
    }
  }

  // gambar dihapus tanpa pengganti
  return { path: null, rollback: noop, finalize: removeOld }
}

/** Hapus file storage setelah baris database berhasil dihapus. */
export async function removeStoredImage(bucket: string, path: string | null): Promise<void> {
  if (!isStoragePath(path)) return
  try {
    await supabase.storage.from(bucket).remove([path])
  } catch {
    // abaikan
  }
}
