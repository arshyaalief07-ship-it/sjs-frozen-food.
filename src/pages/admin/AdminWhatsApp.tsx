import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { WhatsAppDestination } from '@/types'
import { Loading, EmptyState } from '@/components/Feedback'

const emptyForm = { id: '', name: '', role: 'Karyawan', phone: '', active: true }

export default function AdminWhatsApp() {
  const [destinations, setDestinations] = useState<WhatsAppDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadData() {
    setLoading(true)
    const { data } = await supabase.from('whatsapp_destinations').select('*').order('created_at')
    setDestinations((data as WhatsAppDestination[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(dest: WhatsAppDestination) {
    setForm({ id: dest.id, name: dest.name, role: dest.role, phone: dest.phone, active: dest.active })
    setError(null)
    setShowModal(true)
  }

  async function handleDelete(dest: WhatsAppDestination) {
    if (!confirm(`Hapus kontak "${dest.name}"?`)) return
    await supabase.from('whatsapp_destinations').delete().eq('id', dest.id)
    loadData()
  }

  async function handleToggleActive(dest: WhatsAppDestination) {
    await supabase.from('whatsapp_destinations').update({ active: !dest.active }).eq('id', dest.id)
    loadData()
  }

  async function handleSetDefault(dest: WhatsAppDestination) {
    await supabase.from('whatsapp_destinations').update({ is_default: false }).neq('id', dest.id)
    await supabase.from('whatsapp_destinations').update({ is_default: true }).eq('id', dest.id)
    loadData()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const cleanPhone = form.phone.replace(/[^0-9]/g, '')
    const payload = { name: form.name, role: form.role, phone: cleanPhone, active: form.active }

    const res = form.id
      ? await supabase.from('whatsapp_destinations').update(payload).eq('id', form.id)
      : await supabase.from('whatsapp_destinations').insert(payload)

    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    setShowModal(false)
    loadData()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Kontak WhatsApp</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola tujuan WhatsApp untuk menerima pesanan pelanggan.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Kontak
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : destinations.length === 0 ? (
        <EmptyState title="Belum ada kontak WhatsApp" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <div key={dest.id} className="card p-5">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-800">{dest.name}</h3>
                {dest.is_default && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Default
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{dest.role}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">+{dest.phone}</p>
              <button
                type="button"
                onClick={() => handleToggleActive(dest)}
                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${dest.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}
              >
                {dest.active ? 'Aktif' : 'Nonaktif'}
              </button>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(dest)} className="btn-secondary text-xs">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {!dest.is_default && (
                  <button type="button" onClick={() => handleSetDefault(dest)} className="btn-secondary text-xs">
                    <Star className="h-3.5 w-3.5" /> Jadikan Default
                  </button>
                )}
                <button type="button" onClick={() => handleDelete(dest)} className="btn-secondary text-xs text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form onSubmit={handleSave} className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-scale-in sm:rounded-3xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900">{form.id ? 'Edit Kontak' : 'Tambah Kontak'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-full p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Nama</label>
                <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Peran</label>
                <select className="input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                  <option value="Owner">Owner</option>
                  <option value="Karyawan">Karyawan</option>
                </select>
              </div>
              <div>
                <label className="label">Nomor WhatsApp (format 62xxx)</label>
                <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="6281234567890" required />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 accent-brand-500" />
                Aktif
              </label>
              {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Batal
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
