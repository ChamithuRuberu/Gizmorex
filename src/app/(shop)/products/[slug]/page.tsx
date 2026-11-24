import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getCategoryTree } from '@/lib/catalog';
import ProductDetailView from '@/components/products/ProductDetailView';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found | Gizmorex' };
  return {
    title: `${product.name} price in Sri Lanka | Gizmorex`,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, { bySlug }] = await Promise.all([getRelatedProducts(product), getCategoryTree()]);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={related}
      categoryName={bySlug.get(product.category)?.name}
    />
  );
}
