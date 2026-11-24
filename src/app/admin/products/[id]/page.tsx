'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Check,
  ExternalLink,
  Trash2,
  AlertCircle,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CategorySelect from '@/components/admin/CategorySelect';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [directImageUrl, setDirectImageUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    images: [] as string[],
    category: '',
    brand: '',
    stock: '',
    sold: '0',
    features: [''],
    specifications: {} as Record<string, string>,
    tags: '',
    isActive: true,
    isFeatured: false,
    isFlashDeal: false,
    isNewArrival: false,
    flashDealEndsAt: '',
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');


  // Load the product
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      setInitialLoading(true);

      try {
        const res = await fetch(`/api/admin/products/${productId}`);
        const data = await res.json();

        if (data.success && data.data) {
          const p = data.data;

          // Convert specifications map or object
          let specsObj: Record<string, string> = {};
          if (p.specifications) {
            if (p.specifications instanceof Map) {
              specsObj = Object.fromEntries(p.specifications);
            } else if (typeof p.specifications === 'object') {
              specsObj = { ...p.specifications };
            }
          }

          // Format date for datetime-local input
          let flashEnds = '';
          if (p.flashDealEndsAt) {
            const d = new Date(p.flashDealEndsAt);
            if (!isNaN(d.getTime())) {
              flashEnds = d.toISOString().slice(0, 16);
            }
          }

          setFormData({
            name: p.name || '',
            slug: p.slug || '',
            description: p.description || '',
            price: p.price?.toString() || '',
            originalPrice: p.originalPrice?.toString() || p.price?.toString() || '',
            images: Array.isArray(p.images) ? p.images : [],
            category: p.category || '',
            brand: p.brand || '',
            stock: (p.stock ?? 0).toString(),
            sold: (p.sold ?? 0).toString(),
            features: Array.isArray(p.features) && p.features.length > 0 ? p.features : [''],
            specifications: specsObj,
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
            isActive: p.isActive !== false,
            isFeatured: Boolean(p.isFeatured),
            isFlashDeal: Boolean(p.isFlashDeal),
            isNewArrival: Boolean(p.isNewArrival ?? p.isNew),
            flashDealEndsAt: flashEnds,
          });

        } else {
          toast.error(data.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Failed to load product details');
      } finally {
        setInitialLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);


  const handleAddDirectImageUrl = () => {
    const trimmed = directImageUrl.trim();
    if (!trimmed) return;
    if (formData.images.includes(trimmed)) {
      toast.error('Image URL is already added');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, trimmed] }));
    setDirectImageUrl('');
    toast.success('Image URL added!');
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
    toast.success(`Generated slug: ${slug}`);
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      features: newFeatures.length > 0 ? newFeatures : [''],
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${formData.name}"?`)) return;

    const toastId = toast.loading('Deleting product...');
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Product deleted successfully', { id: toastId });
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Failed to delete product', { id: toastId });
      }
    } catch {
      toast.error('Error deleting product', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading('Saving product changes...');

    try {
      if (!formData.name || !formData.slug || !formData.price || !formData.category) {
        toast.error('Please fill in Name, Slug, Price, and Category', { id: toastId });
        setSaving(false);
        return;
      }

      if (formData.images.length === 0) {
        toast.error('Please provide at least one product image', { id: toastId });
        setSaving(false);
        return;
      }

      const parsedPrice = parseFloat(formData.price);
      const parsedOriginal = formData.originalPrice ? parseFloat(formData.originalPrice) : parsedPrice;
      const parsedStock = parseInt(formData.stock) || 0;
      const parsedSold = parseInt(formData.sold) || 0;

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.toLowerCase().trim(),
        description: formData.description,
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        stock: parsedStock,
        sold: parsedSold,
        images: formData.images,
        features: formData.features.map(f => f.trim()).filter(Boolean),
        specifications: formData.specifications,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isFlashDeal: formData.isFlashDeal,
        flashDealEndsAt: formData.flashDealEndsAt ? new Date(formData.flashDealEndsAt).toISOString() : undefined,
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Product updated successfully!', { id: toastId });
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Failed to update product', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong saving product', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Discount preview calculation
  const currentPriceNum = parseFloat(formData.price) || 0;
  const originalPriceNum = parseFloat(formData.originalPrice) || currentPriceNum;
  const discountPercent =
    originalPriceNum > currentPriceNum && originalPriceNum > 0
      ? Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100)
      : 0;

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
        <p className="text-sm font-medium text-gray-500">Loading product options and data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-16 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Products Catalog
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark-300">
              Edit Product: <span className="text-[#FF6B00]">{formData.name || 'Untitled'}</span>
            </h1>
            <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              ID: {productId}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure full options, images, category relationships, pricing, and specs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {formData.slug && (
            <Link
              href={`/products/${formData.slug}`}
              target="_blank"
              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              title="Preview product on live customer storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Preview
            </Link>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="btn-secondary text-red-600 hover:bg-red-50 text-xs py-2 px-3 flex items-center gap-1.5"
            title="Delete this product"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-dark-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              Basic Information
            </h2>
            <span className="text-xs text-gray-400">* Required fields</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Title / Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">
                  URL Slug *
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-xs text-[#FF6B00] font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="input-field"
                placeholder="sony-wh-1000xm5"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Storefront URL: <span className="font-mono text-dark-300">/products/{formData.slug || '...'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input-field"
                placeholder="e.g. Sony, Apple, Samsung"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Detailed Description *
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              placeholder="Write a comprehensive description with features, warranty, in-the-box items..."
            />
          </div>
        </div>

        {/* Section 2: Product Images */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-dark-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF6B00]" />
                Product Media & Images *
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                First image is primary. Drag and drop to reorder images.
              </p>
            </div>
            <span className="text-xs font-bold text-primary">
              {formData.images.length} images uploaded
            </span>
          </div>

          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            maxImages={10}
          />

          {/* Quick Add URL fallback */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Or Add Image from Direct URL (Unsplash, CDN, or Cloud Storage)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={directImageUrl}
                onChange={(e) => setDirectImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or https://..."
                className="input-field flex-1 text-xs"
              />
              <button
                type="button"
                onClick={handleAddDirectImageUrl}
                className="btn-outline text-xs px-3 py-2 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing, Inventory & Sales */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-dark-300">
              Pricing & Inventory Management
            </h2>
            {discountPercent > 0 && (
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {discountPercent}% OFF Customer Savings
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Selling Price (LKR) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field font-semibold text-primary"
                placeholder="95000"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Original / Strike Price (LKR)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="input-field"
                placeholder="105000"
                min="0"
                step="0.01"
              />
              <p className="text-[11px] text-gray-400 mt-1">Leave same or higher for discount</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Current Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input-field"
                placeholder="25"
                required
                min="0"
              />
              {parseInt(formData.stock) <= 5 && parseInt(formData.stock) > 0 && (
                <p className="text-[11px] text-orange-600 font-medium mt-1">⚠️ Low stock alert</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Units Sold
              </label>
              <input
                type="number"
                value={formData.sold}
                onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                className="input-field"
                placeholder="0"
                min="0"
              />
              <p className="text-[11px] text-gray-400 mt-1">Total completed customer orders</p>
            </div>
          </div>
        </div>

        {/* Section 4: Category Relationship & Tags */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-dark-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6B00]" />
                Category & Classification
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Moving a product to another category automatically updates storefront catalog routes and category counts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelect value={formData.category} onChange={(category) => setFormData({ ...formData, category })} />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="wireless, anc, bluetooth, hifi, fast charging"
              />
              {formData.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.split(',').map((t, idx) => {
                    const tag = t.trim();
                    if (!tag) return null;
                    return (
                      <span key={idx} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Key Features */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-dark-300">
                Key Features & Bullet Points
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Shown prominently on the product page as high-impact selling points.
              </p>
            </div>
            <button
              type="button"
              onClick={addFeature}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Point
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <span className="w-6 h-10 flex items-center justify-center text-xs font-bold text-gray-400">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g. Industry-leading Active Noise Cancellation with dual processors"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="btn-secondary text-red-600 hover:bg-red-50 text-xs px-3"
                  title="Remove this bullet"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Technical Specifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-dark-300">
                Technical Specifications Table
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Key-value specs (Display, Battery, Connectivity, Warranty, Processor, etc.)
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {Object.keys(formData.specifications).length} specs added
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="input-field flex-1"
              placeholder="Attribute (e.g. Battery Life, Connectivity)"
            />
            <input
              type="text"
              value={specValue}
              onChange={(e) => setSpecValue(e.target.value)}
              className="input-field flex-1"
              placeholder="Value (e.g. Up to 30 hours, Bluetooth 5.2)"
            />
            <button
              type="button"
              onClick={addSpecification}
              className="btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Spec
            </button>
          </div>

          {Object.entries(formData.specifications).length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 divide-y divide-gray-200 border border-gray-200">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex-1 grid grid-cols-3">
                    <span className="font-bold text-gray-800">{key}</span>
                    <span className="text-gray-600 col-span-2">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className="text-red-500 hover:text-red-700 font-semibold ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Visibility & Marketing Badges */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-dark-300">
              Storefront Badges & Display Options
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-primary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <div>
                <span className="text-xs font-bold text-dark-300 block">Active Status</span>
                <span className="text-[10px] text-gray-500">Live in catalog</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-primary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <div>
                <span className="text-xs font-bold text-dark-300 block">Featured</span>
                <span className="text-[10px] text-gray-500">Homepage grid</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-primary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <div>
                <span className="text-xs font-bold text-dark-300 block">New Arrival</span>
                <span className="text-[10px] text-gray-500">Latest releases</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-primary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.isFlashDeal}
                onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <div>
                <span className="text-xs font-bold text-dark-300 block">Flash Deal</span>
                <span className="text-[10px] text-gray-500">Countdown timer</span>
              </div>
            </label>
          </div>

          {formData.isFlashDeal && (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 space-y-2">
              <label className="block text-xs font-bold text-dark-300">
                Flash Deal Expiration (Date & Time)
              </label>
              <input
                type="datetime-local"
                value={formData.flashDealEndsAt}
                onChange={(e) => setFormData({ ...formData, flashDealEndsAt: e.target.value })}
                className="input-field max-w-sm bg-white"
              />
              <p className="text-[11px] text-orange-700">
                Product will display a live urgency countdown timer on the storefront homepage and product page until this date.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xl flex items-center justify-between sticky bottom-4 z-20">
          <div className="text-xs text-gray-500 hidden sm:block">
            Make sure to verify price, stock, and category before saving.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/admin/products"
              className="btn-secondary text-xs py-2.5 px-4 flex-1 sm:flex-initial text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs py-2.5 px-6 flex-1 sm:flex-initial flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Product Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
