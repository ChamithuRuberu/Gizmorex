'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit, Eye, EyeOff, LayoutTemplate, Layers, CheckCircle2, RotateCcw, ArrowRight, Zap, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import { BRAND } from '@/lib/constants';

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  position?: 'hero' | 'promo-1' | 'promo-2' | 'promo';
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_HERO = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  buttonText: 'Shop now',
  position: 'hero' as const,
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'promo'>('hero');

  // Hero modal states
  const [editingHero, setEditingHero] = useState<Banner | null>(null);
  const [heroForm, setHeroForm] = useState(EMPTY_HERO);
  const [openHeroModal, setOpenHeroModal] = useState(false);
  const [savingHero, setSavingHero] = useState(false);

  // Promo blocks states
  const [promoLeft, setPromoLeft] = useState<{ _id?: string; image: string; title: string; link: string; isActive: boolean }>({
    image: '',
    title: 'Deals Live Now',
    link: '/products?deals=true',
    isActive: true,
  });
  const [promoSavingLeft, setPromoSavingLeft] = useState(false);

  const [promoRight, setPromoRight] = useState<{ _id?: string; image: string; title: string; link: string; isActive: boolean }>({
    image: '',
    title: 'Customer Device Support',
    link: `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`,
    isActive: true,
  });
  const [promoSavingRight, setPromoSavingRight] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const all: Banner[] = data.data;
        setBanners(all);
        setError('');

        // Extract promo blocks
        const p1 = all.find((b) => b.position === 'promo-1');
        const p2 = all.find((b) => b.position === 'promo-2');
        const generic = all.filter((b) => b.position === 'promo');

        const left = p1 || generic[0];
        const right = p2 || (generic[0] && generic[0] !== left ? generic[0] : generic[1]);

        if (left) {
          setPromoLeft({
            _id: left._id,
            image: left.image,
            title: left.title,
            link: left.link,
            isActive: left.isActive,
          });
        } else {
          setPromoLeft({
            image: '',
            title: 'Deals Live Now',
            link: '/products?deals=true',
            isActive: true,
          });
        }

        if (right) {
          setPromoRight({
            _id: right._id,
            image: right.image,
            title: right.title,
            link: right.link,
            isActive: right.isActive,
          });
        } else {
          setPromoRight({
            image: '',
            title: 'Customer Device Support',
            link: `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`,
            isActive: true,
          });
        }
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

  // Filter hero carousel slides
  const heroBanners = banners.filter((b) => !b.position || b.position === 'hero');

  const startNewHero = () => {
    setEditingHero(null);
    setHeroForm({ ...EMPTY_HERO, sortOrder: heroBanners.length });
    setOpenHeroModal(true);
  };

  const startEditHero = (b: Banner) => {
    setEditingHero(b);
    setHeroForm({
      title: b.title,
      subtitle: b.subtitle || '',
      image: b.image,
      link: b.link,
      buttonText: b.buttonText || 'Shop now',
      position: 'hero',
      isActive: b.isActive,
      sortOrder: b.sortOrder,
    });
    setOpenHeroModal(true);
  };

  const saveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      const res = await fetch(editingHero ? `/api/admin/banners/${editingHero._id}` : '/api/admin/banners', {
        method: editingHero ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(data.message);
      setOpenHeroModal(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not save banner');
    } finally {
      setSavingHero(false);
    }
  };

  const patchHero = async (b: Banner, body: Partial<Banner>) => {
    const res = await fetch(`/api/admin/banners/${b._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    data.success ? load() : toast.error(data.error);
  };

  const removeHero = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return;
    const res = await fetch(`/api/admin/banners/${b._id}`, { method: 'DELETE' });
    const data = await res.json();
    data.success ? (toast.success(data.message), load()) : toast.error(data.error);
  };

  // Promo Block Save Handlers
  const handleSavePromo = async (slot: 'left' | 'right') => {
    const isLeft = slot === 'left';
    const current = isLeft ? promoLeft : promoRight;
    const setSaving = isLeft ? setPromoSavingLeft : setPromoSavingRight;
    const pos = isLeft ? 'promo-1' : 'promo-2';

    if (!current.image) {
      toast.error('Please upload an image for this promo block');
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: current.title || (isLeft ? 'Promo Block 1' : 'Promo Block 2'),
        image: current.image,
        link: current.link || '/products',
        position: pos,
        isActive: current.isActive,
      };

      const res = await fetch(current._id ? `/api/admin/banners/${current._id}` : '/api/admin/banners', {
        method: current._id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(current._id ? `${slot === 'left' ? 'Left' : 'Right'} promo block updated!` : `${slot === 'left' ? 'Left' : 'Right'} promo banner added!`);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not save promo block');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPromo = async (slot: 'left' | 'right') => {
    const isLeft = slot === 'left';
    const current = isLeft ? promoLeft : promoRight;

    if (!current._id) {
      // Just clear local draft
      if (isLeft) {
        setPromoLeft({ image: '', title: 'Deals Live Now', link: '/products?deals=true', isActive: true });
      } else {
        setPromoRight({ image: '', title: 'Customer Device Support', link: `https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')}`, isActive: true });
      }
      toast.success('Reset to default');
      return;
    }

    if (!confirm(`Reset this promo block to default? The custom image will be removed.`)) return;

    try {
      const res = await fetch(`/api/admin/banners/${current._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Reset to default promotional card');
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Could not reset promo block');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-dark-300">Banner Management</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Manage your homepage rotating hero slides and middle promotional block images.
          </p>
        </div>

        {activeTab === 'hero' && (
          <button type="button" onClick={startNewHero} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add hero banner
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('hero')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'hero'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-dark-300 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          Hero Carousel Slider ({heroBanners.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
            activeTab === 'promo'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:text-dark-300 hover:bg-gray-100'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          Homepage Promo Blocks (2 Banners)
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* TAB 1: Hero Carousel Banners */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold block text-sm mb-0.5 text-blue-950">Top Hero Carousel</span>
            These banners rotate automatically at the top of the homepage next to the category menu. Recommended ratio: <strong>~3:1 or 2100×700px</strong>.
          </div>

          {loading ? (
            <p className="text-sm text-gray-500 py-4">Loading hero banners...</p>
          ) : heroBanners.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100">
              No hero banners yet. Click &ldquo;Add hero banner&rdquo; above to add your first rotating slide.
            </div>
          ) : (
            <ul className="space-y-3">
              {heroBanners.map((b) => (
                <li key={b._id} className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col sm:flex-row gap-4 sm:items-center shadow-card hover:border-gray-200 transition-all">
                  <div className="relative w-full sm:w-56 aspect-[16/7] rounded-xl overflow-hidden bg-gray-900 flex-shrink-0 border border-gray-100">
                    <Image src={b.image} alt={b.title} fill className="object-cover" sizes="224px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-dark-300 truncate text-sm sm:text-base">{b.title}</p>
                      {!b.isActive && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Hidden
                        </span>
                      )}
                    </div>
                    {b.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{b.subtitle}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Sort order: <span className="font-bold text-gray-600">#{b.sortOrder}</span> · Destination:{' '}
                      <span className="font-mono text-primary bg-orange-50 px-1.5 py-0.5 rounded text-[11px]">{b.link}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => patchHero(b, { isActive: !b.isActive })}
                      className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1"
                      title={b.isActive ? 'Hide banner' : 'Show banner'}
                    >
                      {b.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-green-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditHero(b)}
                      className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1"
                      title="Edit banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHero(b)}
                      className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1 text-red-600 hover:bg-red-50"
                      title="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* TAB 2: Homepage Promo Blocks (2 Banners) */}
      {activeTab === 'promo' && (
        <div className="space-y-5">
          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block text-sm mb-0.5 text-amber-950">Middle Promotional Blocks (2 Tiles)</span>
            These two promotional blocks appear directly in the middle of your homepage. You can upload custom marketing banner images for either or both blocks. If an image is not uploaded, the storefront automatically falls back to the default interactive Deals card or WhatsApp Support card.
            <br />
            <strong>Recommended image size:</strong> 1200 × 400px or ~3:1 aspect ratio.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Block 1: Left Slot (Deals Slot) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-sm font-extrabold text-dark-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    Block 1 (Left Banner Slot)
                  </span>
                  {promoLeft.image ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Custom Image Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      Using Default Deals Card
                    </span>
                  )}
                </div>

                {/* Preview Box */}
                <div className="mb-4">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Storefront Preview</span>
                  {promoLeft.image ? (
                    <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner group">
                      <Image src={promoLeft.image} alt="Promo block 1 preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden p-5 text-white bg-gradient-to-br from-[#FF7A1A] via-[#FF6B00] to-[#E14A00] flex flex-col justify-center shadow-inner">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-white/90">
                        <Zap className="w-3.5 h-3.5 fill-white" /> Deals live now
                      </span>
                      <span className="text-xl sm:text-2xl font-black mt-1">Up to 63% off</span>
                      <span className="text-xs text-white/90 mt-0.5">On chargers, cables, power banks and more</span>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                  <div>
                    <span className="block text-xs font-bold text-gray-700 mb-1">Banner Image *</span>
                    <ImageUpload
                      images={promoLeft.image ? [promoLeft.image] : []}
                      onChange={(imgs) => setPromoLeft({ ...promoLeft, image: imgs[0] || '' })}
                      maxImages={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Banner Title / Alt Description</label>
                    <input
                      type="text"
                      value={promoLeft.title}
                      onChange={(e) => setPromoLeft({ ...promoLeft, title: e.target.value })}
                      placeholder="e.g. Flash Weekend Tech Deals"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Click Link Destination</label>
                    <input
                      type="text"
                      value={promoLeft.link}
                      onChange={(e) => setPromoLeft({ ...promoLeft, link: e.target.value })}
                      placeholder="/products?deals=true"
                      className="input-field text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleResetPromo('left')}
                  className="btn-outline text-xs py-2 px-3 text-gray-600 hover:text-red-600 hover:border-red-300 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to default
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePromo('left')}
                  disabled={promoSavingLeft || !promoLeft.image}
                  className="btn-primary text-xs py-2 px-4 disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {promoSavingLeft ? 'Saving...' : 'Save Block 1 Image'}
                </button>
              </div>
            </div>

            {/* Block 2: Right Slot (Device / Support Slot) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <span className="text-sm font-extrabold text-dark-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-primary flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    Block 2 (Right Banner Slot)
                  </span>
                  {promoRight.image ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Custom Image Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      Using Default Support Card
                    </span>
                  )}
                </div>

                {/* Preview Box */}
                <div className="mb-4">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Live Storefront Preview</span>
                  {promoRight.image ? (
                    <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden bg-gray-900 border border-gray-100 shadow-inner group">
                      <Image src={promoRight.image} alt="Promo block 2 preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden p-5 text-white bg-gradient-to-br from-[#262626] to-[#111] flex flex-col justify-center shadow-inner">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                        <MessageCircle className="w-3.5 h-3.5" /> Not sure what fits?
                      </span>
                      <span className="text-lg sm:text-xl font-black mt-1 leading-tight">
                        Tell us your device,<br />we&apos;ll find the right one
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5">
                  <div>
                    <span className="block text-xs font-bold text-gray-700 mb-1">Banner Image *</span>
                    <ImageUpload
                      images={promoRight.image ? [promoRight.image] : []}
                      onChange={(imgs) => setPromoRight({ ...promoRight, image: imgs[0] || '' })}
                      maxImages={1}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Banner Title / Alt Description</label>
                    <input
                      type="text"
                      value={promoRight.title}
                      onChange={(e) => setPromoRight({ ...promoRight, title: e.target.value })}
                      placeholder="e.g. Device Compatibility Guide"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Click Link Destination</label>
                    <input
                      type="text"
                      value={promoRight.link}
                      onChange={(e) => setPromoRight({ ...promoRight, link: e.target.value })}
                      placeholder={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, '')} or /products`}
                      className="input-field text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleResetPromo('right')}
                  className="btn-outline text-xs py-2 px-3 text-gray-600 hover:text-red-600 hover:border-red-300 inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset to default
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePromo('right')}
                  disabled={promoSavingRight || !promoRight.image}
                  className="btn-primary text-xs py-2 px-4 disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {promoSavingRight ? 'Saving...' : 'Save Block 2 Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Modal */}
      {openHeroModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="banner-form-title">
          <form onSubmit={saveHero} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <h2 id="banner-form-title" className="text-lg font-extrabold text-dark-300">
              {editingHero ? 'Edit Hero Banner' : 'New Hero Banner Slide'}
            </h2>

            <div>
              <span className="block text-xs font-bold text-gray-700 mb-1">Slide Image * (Recommended 2100 × 700px)</span>
              <ImageUpload images={heroForm.image ? [heroForm.image] : []} onChange={(imgs) => setHeroForm({ ...heroForm, image: imgs[0] || '' })} maxImages={1} />
            </div>

            <label className="block">
              <span className="block text-xs font-bold text-gray-700 mb-1">Internal Name *</span>
              <input required placeholder="e.g. UGREEN Mega Sale" value={heroForm.title} onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })} className="input-field text-sm" />
              <span className="text-[11px] text-gray-400 mt-0.5 block">Used for screen readers, image alt tags, and admin identification.</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-xs font-bold text-gray-700 mb-1">Display Order</span>
                <input type="number" value={heroForm.sortOrder} onChange={(e) => setHeroForm({ ...heroForm, sortOrder: Number(e.target.value) })} className="input-field text-sm" />
              </label>
            </div>

            <label className="block">
              <span className="block text-xs font-bold text-gray-700 mb-1">Click Link Destination</span>
              <input value={heroForm.link} onChange={(e) => setHeroForm({ ...heroForm, link: e.target.value })} className="input-field font-mono text-sm" placeholder="/categories/audio or /products" />
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={heroForm.isActive} onChange={(e) => setHeroForm({ ...heroForm, isActive: e.target.checked })} className="accent-primary w-4 h-4" />
              Show on the storefront
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setOpenHeroModal(false)} className="btn-outline text-xs py-2 px-4">
                Cancel
              </button>
              <button type="submit" disabled={savingHero || !heroForm.image} className="btn-primary text-xs py-2 px-4 disabled:opacity-60">
                {savingHero ? 'Saving...' : 'Save Hero Banner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
