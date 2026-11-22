'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Sparkles,
  Upload,
  X,
  ExternalLink,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { broadcastCategoryUpdate } from '@/store/categoryStore';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: 'Package',
    color: '#FF6B00',
    sortOrder: 0,
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

  const handleSeed = async () => {
    const toastId = toast.loading('Populating default categories with photos...');
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Categories created!', { id: toastId });
        await fetchCategories();
        broadcastCategoryUpdate();
      } else {
        toast.error(data.error || 'Failed to populate', { id: toastId });
      }
    } catch {
      toast.error('Failed to populate categories', { id: toastId });
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
            Customize category titles, storefront photos, and product classifications ({categories.length} categories)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
            title="Populate 8 default tech categories with photos"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Populate 8 Categories
          </button>
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

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100 max-w-md mx-auto">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-dark-300 mb-1">No categories in database</h3>
          <p className="text-xs text-gray-400 mb-4">
            Click below to populate the 8 standard categories with high-resolution photos into your database.
          </p>
          <button onClick={handleSeed} className="btn-primary text-xs py-2 px-4 mx-auto inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Populate 8 Categories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-all overflow-hidden flex flex-col group"
            >
              {/* Category Photo Header */}
              <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
                    style={{ backgroundColor: `${category.color || '#FF6B00'}15` }}
                  >
                    <ImageIcon className="w-10 h-10 mb-1 text-gray-400" />
                    <span className="text-xs text-gray-500">No Photo Uploaded</span>
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-[11px] text-primary font-bold hover:underline mt-1"
                    >
                      + Add Photo
                    </button>
                  </div>
                )}
                {/* Product Count Pill */}
                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {category.productCount || 0} Products
                </div>
                {/* Actions Pill */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-lg shadow-sm">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-1 hover:bg-orange-50 hover:text-primary rounded text-gray-600 transition-colors"
                    title="Edit Category & Photo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id, category.name)}
                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-gray-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-dark-300 text-base">{category.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        category.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {category.description || 'Browse high-quality electronics in this category.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/categories/${category.slug}`}
                    target="_blank"
                    className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    View in Store <ExternalLink className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => openEditModal(category)}
                    className="btn-outline text-[11px] py-1 px-2.5"
                  >
                    Edit Photo & Info
                  </button>
                </div>
              </div>
            </div>
          ))}
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
