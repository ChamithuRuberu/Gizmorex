'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Upload,
  X,
  ExternalLink,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { broadcastCategoryUpdate } from '@/store/categoryStore';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon: string;
  color: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  parentSlug?: string | null;
}

// Preset stock photos for rapid 1-click category setup
const PRESET_PHOTOS = [
  { label: 'Smartphones', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80' },
  { label: 'Laptops', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80' },
  { label: 'Audio & Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { label: 'Gaming & Consoles', url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&q=80' },
  { label: 'Smart Home', url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80' },
  { label: 'Cameras', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80' },
  { label: 'Accessories', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80' },
  { label: 'Wearables', url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: 'Package',
    color: '#FF6B00',
    sortOrder: 0,
    parent: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
        resetForm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('Uploading category photo...');

    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Category photo uploaded!', { id: toastId });
      } else {
        toast.error(data.error || 'Upload failed', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading file', { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading(editingCategory ? 'Updating category...' : 'Creating category...');

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // Disappear modal popup immediately on success
        setShowModal(false);
        resetForm();
        toast.success(data.message || (editingCategory ? 'Category updated!' : 'Category created!'), { id: toastId });
        await fetchCategories();
        broadcastCategoryUpdate();
      } else {
        // Keep popup open so the user can fix errors
        toast.error(data.error || 'Failed to save category', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    const toastId = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Category deleted', { id: toastId });
        await fetchCategories();
        broadcastCategoryUpdate();
      } else {
        toast.error(data.error || 'Failed to delete category', { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category', { id: toastId });
    }
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulkDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const chosen = categories.filter((c) => selected.has(c._id));
    const withStuff = chosen.filter((c) => (c.productCount || 0) > 0 || categories.some((x) => x.parentSlug === c.slug));

    let cascade = false;
    if (withStuff.length > 0) {
      cascade = confirm(
        `${withStuff.length} of the ${ids.length} selected categor${ids.length === 1 ? 'y has' : 'ies have'} products or sub-categories.\n\n` +
          `OK = delete them AND all their products and sub-categories (cannot be undone).\n` +
          `Cancel = keep those, delete only the empty ones.`
      );
      if (cascade && !confirm('Last check: really delete these categories together with all their products?')) return;
    } else if (!confirm(`Delete ${ids.length} empty categor${ids.length === 1 ? 'y' : 'ies'}?`)) {
      return;
    }

    setBulkBusy(true);
    const toastId = toast.loading('Deleting...');
    try {
      const res = await fetch('/api/admin/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids, cascade }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { id: toastId, duration: 6000 });
        setSelected(new Set());
        await fetchCategories();
        broadcastCategoryUpdate();
      } else {
        toast.error(data.error || 'Bulk delete failed', { id: toastId });
      }
    } catch {
      toast.error('Bulk delete failed', { id: toastId });
    } finally {
      setBulkBusy(false);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || 'Package',
      color: category.color || '#FF6B00',
      sortOrder: category.sortOrder || 0,
      parent: category.parentSlug || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      icon: 'Package',
      color: '#FF6B00',
      sortOrder: 0,
      parent: '',
    });
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
        <p className="text-xs text-gray-500 font-medium">Loading categories catalog...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-300">Category Management</h1>
          <p className="text-sm text-gray-600">
            {categories.filter((c) => !c.parentSlug).length} main categories, {categories.filter((c) => c.parentSlug).length} sub-categories. Products belong to a sub-category.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-2 z-20 bg-dark-300 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg">
          <span className="text-sm font-bold">{selected.size} selected</span>
          <button
            disabled={bulkBusy}
            onClick={bulkDelete}
            className="text-xs font-bold bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete selected
          </button>
          <button
            onClick={() => setSelected(selected.size === categories.length ? new Set() : new Set(categories.map((c) => c._id)))}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            {selected.size === categories.length ? 'Select none' : 'Select all'}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-gray-300 hover:text-white">
            Clear
          </button>
        </div>
      )}

      {/* Categories, grouped: each top-level category with its sub-categories */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-dark-300 mb-1">No categories yet</h3>
          <p className="text-xs text-gray-400">
            Add one with the button above, or import the catalog with <code>npm run import:ido</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories
            .filter((c) => !c.parentSlug)
            .map((parent) => {
              const subs = categories.filter((c) => c.parentSlug === parent.slug);
              return (
                <section key={parent._id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                  <CategoryRow
                    category={parent}
                    isParent
                    subCount={subs.length}
                    selected={selected.has(parent._id)}
                    onToggle={() => toggleOne(parent._id)}
                    onEdit={() => openEditModal(parent)}
                    onDelete={() => handleDelete(parent._id, parent.name)}
                    onAddSub={() => {
                      resetForm();
                      setFormData((f) => ({ ...f, parent: parent.slug }));
                      setShowModal(true);
                    }}
                  />
                  {subs.length > 0 && (
                    <ul className="divide-y divide-gray-50 border-t border-gray-100">
                      {subs.map((sub) => (
                        <li key={sub._id}>
                          <CategoryRow
                            category={sub}
                            selected={selected.has(sub._id)}
                            onToggle={() => toggleOne(sub._id)}
                            onEdit={() => openEditModal(sub)}
                            onDelete={() => handleDelete(sub._id, sub.name)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
        </div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-dark-300">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h2>
                <p className="text-xs text-gray-500">
                  Upload a photo, customize name, and configure catalog placement
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-dark-300 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Category Photo Section */}
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-dark-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#FF6B00]" />
                    Category Photo (Primary Banner)
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Photo Preview Box */}
                {formData.image ? (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border-2 border-primary/20 shadow-inner group">
                    <Image
                      src={formData.image}
                      alt="Category preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Replace Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-primary rounded-xl h-36 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-orange-50/30 text-center p-4"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Click to upload category photo</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Or Paste Direct Photo URL (Unsplash or CDN):
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-field text-xs"
                  />
                </div>

                {/* Quick 1-Click Preset Photos */}
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">
                    Or select a suggested high-res photo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PHOTOS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: p.url }));
                          toast.success(`Applied ${p.label} photo!`);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          formData.image === p.url
                            ? 'bg-primary text-white border-primary font-bold shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-orange-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Smart Home"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700">
                      URL Slug *
                    </label>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-[11px] text-primary font-bold hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input-field font-mono text-xs"
                    placeholder="smart-home"
                    required
                  />
                </div>
              </div>

              {/* Parent */}
              <div>
                <label htmlFor="category-parent" className="block text-xs font-bold text-gray-700 mb-1">
                  Parent category
                </label>
                <select
                  id="category-parent"
                  value={formData.parent}
                  onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                  className="input-field bg-white text-sm"
                >
                  <option value="">None (top-level category)</option>
                  {categories
                    .filter((c) => !c.parentSlug && c.slug !== editingCategory?.slug)
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">Products are added to sub-categories; a parent shows all of them.</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field text-xs"
                  rows={2}
                  placeholder="Short summary displayed on category banners and catalog headers..."
                />
              </div>

              {/* Sort Order & Accent */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field text-xs"
                    min="0"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input-field text-xs font-mono flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  isParent = false,
  subCount = 0,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onAddSub,
}: {
  category: Category;
  isParent?: boolean;
  subCount?: number;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSub?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 ${isParent ? 'px-4 sm:px-5 py-4 bg-gray-50/60' : 'pl-10 sm:pl-14 pr-4 sm:pr-5 py-3'} ${
        selected ? '!bg-orange-50' : 'hover:bg-gray-50'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${category.name}`}
        className="w-4 h-4 accent-[#FF6B00] cursor-pointer flex-shrink-0"
      />
      <button
        type="button"
        onClick={onEdit}
        title="Change photo"
        className={`relative flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-orange-50 flex items-center justify-center ${
          isParent ? 'w-12 h-12' : 'w-10 h-10'
        }`}
      >
        {category.image ? (
          <Image src={category.image} alt="" fill className="object-cover" sizes="48px" />
        ) : (
          <CategoryIcon name={category.icon} label={category.name} className={`${isParent ? 'w-6 h-6' : 'w-5 h-5'} text-primary`} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${isParent ? 'text-base font-black' : 'text-sm font-semibold'} text-dark-300 truncate`}>{category.name}</span>
          {!category.isActive && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-200 text-gray-600">Hidden</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {category.productCount} product{category.productCount === 1 ? '' : 's'}
          {isParent && ` · ${subCount} sub-categor${subCount === 1 ? 'y' : 'ies'}`}
          <span className="hidden sm:inline text-gray-300"> · /{category.slug}</span>
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onAddSub && (
          <button
            type="button"
            onClick={onAddSub}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-primary hover:bg-orange-50 px-2.5 py-1.5 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> Sub-category
          </button>
        )}
        <Link
          href={`/categories/${category.slug}`}
          target="_blank"
          className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-orange-50"
          title="View in store"
          aria-label={`View ${category.name} in store`}
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-orange-50"
          title="Edit"
          aria-label={`Edit ${category.name}`}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
          title="Delete"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
