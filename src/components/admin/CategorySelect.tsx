'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/types';

/**
 * Sub-category picker for the product form, grouped by parent (like ido.lk's menu).
 * Products always belong to a sub-category; new categories are made in Admin → Categories.
 */
export default function CategorySelect({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const [tree, setTree] = useState<Category[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => (d.success ? setTree(d.tree) : setError(d.error)))
      .catch(() => setError('Could not load categories'));
  }, []);

  const known = tree.some((p) => p.slug === value || p.children?.some((c) => c.slug === value));

  return (
    <div>
      <label htmlFor="product-category" className="block text-sm font-semibold text-gray-700 mb-1">
        Category *
      </label>
      <select
        id="product-category"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field bg-white"
        required
      >
        <option value="">Select a sub-category</option>
        {value && !known && tree.length > 0 && <option value={value}>{value} (old category, please change)</option>}
        {tree.map((parent) =>
          parent.children?.length ? (
            <optgroup key={parent.slug} label={parent.name}>
              {parent.children.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ) : (
            <option key={parent.slug} value={parent.slug}>
              {parent.name}
            </option>
          )
        )}
      </select>
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : (
        <p className="text-xs text-gray-500 mt-1">
          Missing one?{' '}
          <Link href="/admin/categories" className="text-primary font-semibold hover:underline">
            Add it in Categories
          </Link>
          {value && known && (
            <>
              {' · '}
              <Link href={`/categories/${value}`} target="_blank" className="text-primary hover:underline">
                View on store
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
