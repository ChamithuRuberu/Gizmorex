'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ExternalLink, Eye, EyeOff, Tag } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface BrandRow {
  key: string;
  name: string;
  count: number;
  logo: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await fetch('/api/admin/brands', { cache: 'no-store' });
      const d = await res.json();
      if (d.success) setBrands(d.data);
      else setError(d.error || 'Could not load brands');
    } catch {
      setError('Could not load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (b: BrandRow, changes: Partial<BrandRow>) => {
    setBrands((list) => list.map((x) => (x.key === b.key ? { ...x, ...changes } : x)));
    const res = await fetch('/api/admin/brands', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: b.key, name: b.name, ...changes }),
    });
    const d = await res.json().catch(() => ({}));
    if (d.success) toast.success(d.message || 'Saved');
    else {
      toast.error(d.error || 'Could not save');
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-300">Brands</h1>
        <p className="text-sm text-gray-600">
          Brands come from your products. Upload a logo to show it in &quot;Top brands&quot; on the home page; brands without a logo show their name.
          Use logo files you are allowed to use (for example from the brand or your distributor).
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading brands…</p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-100">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          No brands yet. Set a brand on your products and it appears here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((b) => (
            <div key={b.key} className={`bg-white rounded-2xl border shadow-card p-4 flex flex-col gap-3 ${b.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-70'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-dark-300 truncate">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.count} product{b.count === 1 ? '' : 's'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/products?brand=${encodeURIComponent(b.name)}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-orange-50" aria-label={`View ${b.name} in store`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => save(b, { isActive: !b.isActive })}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-orange-50"
                    title={b.isActive ? 'Hide from Top brands' : 'Show in Top brands'}
                    aria-label={b.isActive ? `Hide ${b.name}` : `Show ${b.name}`}
                  >
                    {b.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="h-20 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                {b.logo ? (
                  <Image src={b.logo} alt={`${b.name} logo`} fill className="object-contain p-3" sizes="240px" />
                ) : (
                  <span className="text-lg font-black uppercase tracking-tight text-gray-400">{b.name}</span>
                )}
              </div>

              <ImageUpload
                images={b.logo ? [b.logo] : []}
                onChange={(imgs) => save(b, { logo: imgs[0] || '' })}
                maxImages={1}
              />

              <label className="flex items-center gap-2 text-xs text-gray-600">
                Order
                <input
                  type="number"
                  defaultValue={b.sortOrder}
                  onBlur={(e) => Number(e.target.value) !== b.sortOrder && save(b, { sortOrder: Number(e.target.value) })}
                  className="input-field !py-1 !text-xs w-20"
                />
                <span className="text-gray-400">lower shows first</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
