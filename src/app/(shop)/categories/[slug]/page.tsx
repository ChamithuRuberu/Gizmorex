import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryTree, listProducts } from '@/lib/catalog';
import ProductCard from '@/components/products/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { bySlug } = await getCategoryTree();
  const category = bySlug.get(slug.toLowerCase());
  return { title: category ? `${category.name} price in Sri Lanka | Gizmorex` : 'Category | Gizmorex' };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { bySlug } = await getCategoryTree();
  const category = bySlug.get(slug.toLowerCase());
  if (!category) notFound();

  const parent = category.parentSlug ? bySlug.get(category.parentSlug) : undefined;
  // Sub-category chips: a parent shows its children, a sub-category shows its siblings.
  const chips = (parent ?? category).children ?? [];
  const { products, total } = await listProducts({ category: category.slug, limit: 100 });

  return (
    <div className="container-custom py-6">
      <h1 className="sr-only">{category.name}</h1>
      <Breadcrumb
        items={[
          { label: 'Categories', href: '/categories' },
          ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
          { label: category.name },
        ]}
      />

      {chips.length > 0 && (
        <nav aria-label="Sub-categories" className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/categories/${(parent ?? category).slug}`}
            className={`px-3 py-1.5 rounded-full text-sm border ${!parent ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:border-primary'}`}
          >
            All {(parent ?? category).name}
          </Link>
          {chips.map((c) => (
            <Link
              key={c.slug}
              href={`/categories/${c.slug}`}
              className={`px-3 py-1.5 rounded-full text-sm border ${c.slug === category.slug ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:border-primary'}`}
            >
              {c.name} {c.productCount > 0 && <span className="opacity-70">({c.productCount})</span>}
            </Link>
          ))}
        </nav>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-gray-100">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
