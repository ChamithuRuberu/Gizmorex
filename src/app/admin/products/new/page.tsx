'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/admin/ImageUpload';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    features: [''],
    specifications: {} as Record<string, string>,
    tags: '',
    isActive: true,
    isFeatured: false,
    isFlashDeal: false,
    isNewArrival: true,
    flashDealEndsAt: '',
  });

  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const [categories, setCategories] = useState<string[]>([
    'Smartphones',
    'Laptops',
    'Audio',
    'Gaming',
    'Smart Home',
    'Cameras',
    'Accessories',
    'Wearables',
  ]);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const fetchedNames = data.data.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...fetchedNames, ...prev])));
        }
      } catch (err) {
        // use default categories
      }
    }
    fetchCategories();
  }, []);

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      setCategories(prev => [trimmed, ...prev]);
    }
    setFormData(prev => ({ ...prev, category: trimmed }));
    setCustomCategoryInput('');
    setIsAddingCustomCategory(false);
    toast.success(`Category "${trimmed}" selected!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading('Creating product...');

    try {
      // Validation
      if (!formData.name || !formData.slug || !formData.price || !formData.category) {
        toast.error('Please fill in all required fields', { id: toastId });
        setLoading(false);
        return;
      }

      if (formData.images.length === 0) {
        toast.error('Please upload at least one product image', { id: toastId });
        setLoading(false);
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        features: formData.features.filter((f) => f.trim() !== ''),
        tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t !== ''),
        flashDealEndsAt: formData.flashDealEndsAt || undefined,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Product created successfully!', { id: toastId });
        router.push('/admin/products');
      } else {
        toast.error(data.error || 'Failed to create product', { id: toastId });
      }
    } catch (error) {
      toast.error('Something went wrong', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData({ ...formData, slug });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const addSpecification = () => {
    if (specKey && specValue) {
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey]: specValue,
        },
      });
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData({ ...formData, specifications: newSpecs });
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#FF6B00] mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-dark-300">Add New Product</h1>
        <p className="text-sm text-gray-600">
          Create a new product with images and details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="e.g., iPhone 15 Pro Max"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Slug *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input-field flex-1"
                    placeholder="iphone-15-pro-max"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="btn-secondary"
                  >
                    Generate
                  </button>
                </div>
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
                  placeholder="e.g., Apple"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description *
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Write a detailed product description..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Product Images *</h2>
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            maxImages={10}
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">
            Pricing & Inventory
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Price (LKR) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                placeholder="389900"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Original Price (LKR)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({ ...formData, originalPrice: e.target.value })
                }
                className="input-field"
                placeholder="429900"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="input-field"
                placeholder="50"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">
            Category & Tags
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingCustomCategory ? 'Choose from list' : '+ Add New Category'}
                </button>
              </div>

              {isAddingCustomCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="e.g. Tablets, Drones, Monitors"
                    className="input-field flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="btn-primary text-xs px-3 py-2 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field bg-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              {formData.category && (
                <p className="text-[11px] text-green-600 font-medium mt-1.5 flex items-center gap-1">
                  ✓ Visible on storefront at:{' '}
                  <span className="font-mono text-dark-300 bg-gray-100 px-1.5 py-0.5 rounded">
                    /categories/{formData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                  </span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-field"
                placeholder="5g, flagship, premium"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Key Features</h2>
          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="input-field flex-1"
                  placeholder="e.g., 6.7-inch Super Retina XDR display"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addFeature} className="btn-outline w-full">
              + Add Feature
            </button>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Specifications</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="input-field flex-1"
                placeholder="Specification name (e.g., Display)"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="input-field flex-1"
                placeholder="Value (e.g., 6.7 inches)"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="btn-primary"
              >
                Add
              </button>
            </div>

            {Object.entries(formData.specifications).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{key}:</span>{' '}
                      <span className="text-sm text-gray-600">{value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(key)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Product Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (visible in store)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <span className="text-sm font-medium text-gray-700">
                Featured Product
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) =>
                  setFormData({ ...formData, isNewArrival: e.target.checked })
                }
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <span className="text-sm font-medium text-gray-700">New Arrival</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFlashDeal}
                onChange={(e) =>
                  setFormData({ ...formData, isFlashDeal: e.target.checked })
                }
                className="w-4 h-4 text-[#FF6B00] rounded focus:ring-[#FF6B00]"
              />
              <span className="text-sm font-medium text-gray-700">Flash Deal</span>
            </label>

            {formData.isFlashDeal && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Flash Deal Ends At
                </label>
                <input
                  type="datetime-local"
                  value={formData.flashDealEndsAt}
                  onChange={(e) =>
                    setFormData({ ...formData, flashDealEndsAt: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
