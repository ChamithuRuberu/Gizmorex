'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { getProductBySlug, MOCK_PRODUCTS } from '@/lib/data';
import { formatPrice } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductCard from '@/components/products/ProductCard';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const routerParams = useParams();
  const slug = typeof routerParams?.slug === 'string' ? routerParams.slug : Array.isArray(routerParams?.slug) ? routerParams.slug[0] : '';

  const [product, setProduct] = useState<Product | null>(() => getProductBySlug(slug) || null);
  const [loading, setLoading] = useState(!product);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'reviews'>('features');
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const { addItem, openCart } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch product from API, checking local store:', err);
      }

      // Check local fallback store
      const local = getProductBySlug(slug);
      if (local) {
        setProduct(local);
      }
      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-[500px] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    openCart();
    toast.success(`${product.name} added to cart!`, { icon: '🛒' });
  };

  const handleWishlist = () => {
    toggle(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist!', {
      icon: wishlisted ? '💔' : '❤️',
    });
  };

  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const relatedProducts = MOCK_PRODUCTS.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
  const specs = product.specifications ? Object.entries(product.specifications) : [];
  const displayedSpecs = showAllSpecs ? specs : specs.slice(0, 5);

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://placehold.co/600x600'];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-6">
        <Breadcrumb items={[
          { label: 'Products', href: '/products' },
          { label: product.category, href: `/categories/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
          { label: product.name }
        ]} />

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3 border border-gray-100">
                <Image
                  src={images[selectedImage] || images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {discountPct > 0 && (
                  <span className="absolute top-3 left-3 bg-[#FF6B00] text-white text-sm font-bold px-2.5 py-1 rounded-lg">
                    -{discountPct}%
                  </span>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        i === selectedImage ? 'border-[#FF6B00]' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-sm text-primary font-semibold mb-1">{product.brand}</p>
              <h1 className="text-2xl font-bold text-dark-300 mb-3 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={product.rating || 5} numReviews={product.numReviews || 0} size="md" />
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-green-600 font-medium">{product.sold || 0} sold</span>
              </div>

              <div className="flex items-end gap-3 mb-5">
                <span className="text-3xl font-black text-primary">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-gray-400 text-lg line-through">{formatPrice(product.originalPrice)}</span>
                    <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">
                      Save {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              <div
                className="text-gray-600 text-sm leading-relaxed mb-5 rich-text-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {/* Stock */}
              <div className={`text-sm font-medium mb-5 ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚠ Only ${product.stock} left in stock!` : '✕ Out of Stock'}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-3 hover:bg-gray-50 font-bold text-lg transition-colors"
                  >−</button>
                  <span className="px-5 py-3 font-bold text-dark-300 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(Math.max(1, product.stock), q + 1))}
                    className="px-4 py-3 hover:bg-gray-50 font-bold text-lg transition-colors"
                  >+</button>
                </div>
                <span className="text-xs text-gray-500">Max: {product.stock}</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary text-base justify-center py-3"
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    wishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 hover:border-red-300 text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary text-gray-400 hover:text-primary transition-all"
                  title="Share product"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: 'Free Delivery', sub: 'On orders > Rs. 10,000' },
                  { icon: Shield, label: '1 Year Warranty', sub: 'Official warranty' },
                  { icon: RotateCcw, label: '7-Day Returns', sub: 'Easy returns' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl">
                    <Icon className="w-5 h-5 text-primary mb-1" />
                    <span className="text-xs font-semibold text-dark-300">{label}</span>
                    <span className="text-xs text-gray-400">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex border-b border-gray-100 mb-5 gap-1">
            {(['features', 'specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-dark-300'
                }`}
              >
                {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${product.numReviews || 0})` : 'Features'}
              </button>
            ))}
          </div>

          {activeTab === 'features' && (
            <ul className="space-y-2">
              {Array.isArray(product.features) && product.features.length > 0 ? (
                product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-400">Standard product features included.</li>
              )}
            </ul>
          )}

          {activeTab === 'specs' && (
            <div>
              {specs.length > 0 ? (
                <>
                  <table className="w-full text-sm">
                    <tbody>
                      {displayedSpecs.map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4 font-medium text-gray-500 w-1/3">{key}</td>
                          <td className="py-3 text-dark-300">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {specs.length > 5 && (
                    <button
                      onClick={() => setShowAllSpecs(!showAllSpecs)}
                      className="mt-3 text-primary text-sm font-medium flex items-center gap-1 hover:underline"
                    >
                      {showAllSpecs ? (<><ChevronUp className="w-4 h-4" /> Show Less</>) : (<><ChevronDown className="w-4 h-4" /> Show All {specs.length} Specs</>)}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Specifications not specified.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p>Customer reviews will appear here once verified purchases are made.</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="section-title mb-5">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
