'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY = { title: '', subtitle: '', image: '', link: '/products', buttonText: 'Shop now', isActive: true, sortOrder: 0 };

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
        setError('');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Could not load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ ...EMPTY, sortOrder: banners.length });
    setOpen(true);
  };

  const startEdit = (b: Banner) => {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, buttonText: b.buttonText, isActive: b.isActive, sortOrder: b.sortOrder });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/admin/banners/${editing._id}` : '/api/admin/banners', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(data.message);
      setOpen(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const patch = async (b: Banner, body: Partial<Banner>) => {
    const res = await fetch(`/api/admin/banners/${b._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    data.success ? load() : toast.error(data.error);
  };

  const remove = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    const res = await fetch(`/api/admin/banners/${b._id}`, { method: 'DELETE' });
    const data = await res.json();
    data.success ? (toast.success(data.message), load()) : toast.error(data.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-300">Banners</h1>
          <p className="text-sm text-gray-600">Slides at the top of the home page, shown in order. Images are stored on Cloudinary.</p>
        </div>
        <button type="button" onClick={startNew} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add banner
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading banners...</p>
      ) : banners.length === 0 && !error ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100">
          No banners yet. Until you add one, the home page shows your categories and products only.
        </div>
      ) : (
        <ul className="space-y-3">
          {banners.map((b) => (
            <li key={b._id} className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="relative w-full sm:w-48 aspect-[16/7] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={b.image} alt={b.title} fill className="object-cover" sizes="200px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark-300 truncate">{b.title}</p>
                <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>
                <p className="text-xs text-gray-400 mt-1">
                  #{b.sortOrder} · {b.buttonText} → <span className="font-mono">{b.link}</span>
                  {!b.isActive && <span className="ml-2 text-amber-700 font-semibold">Hidden</span>}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => patch(b, { isActive: !b.isActive })} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1" aria-label={b.isActive ? 'Hide banner' : 'Show banner'}>
                  {b.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button type="button" onClick={() => startEdit(b)} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1" aria-label="Edit banner">
                  <Edit className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => remove(b)} className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1 text-red-600" aria-label="Delete banner">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="banner-form-title">
          <form onSubmit={save} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 id="banner-form-title" className="text-lg font-bold text-dark-300">{editing ? 'Edit banner' : 'New banner'}</h2>

            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-1">Image * (wide, about 1600 × 700)</span>
              <ImageUpload images={form.image ? [form.image] : []} onChange={(imgs) => setForm({ ...form, image: imgs[0] || '' })} maxImages={1} />
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Title *</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</span>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1">Button text</span>
                <input value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} className="input-field" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1">Order</span>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-field" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 mb-1">Link</span>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field font-mono text-sm" placeholder="/categories/audio" />
              <span className="text-xs text-gray-500">A page on your site, e.g. /categories/keyboard-and-mouse or /products?deals=true</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" />
              Show on the home page
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-outline text-sm py-2 px-4">
                Cancel
              </button>
              <button type="submit" disabled={saving || !form.image} className="btn-primary text-sm py-2 px-4 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save banner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
