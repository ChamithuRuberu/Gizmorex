import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
  const chips = (parent ?? category).children?.filter((c) => c.productCount > 0) ?? [];
  const { products, total } = await listProducts({ category: category.slug, limit: 100 });

  return (
    <div className="container-custom py-6">
      <Breadcrumb
        items={[
          { label: 'Categories', href: '/categories' },
          ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
          { label: category.name },
        ]}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{parent ? parent.name : 'Category'}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-dark-300 mt-1">{category.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} product{total === 1 ? '' : 's'}
          </p>
        </div>
        {category.image ? (
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
            <Image src={category.image} alt={category.name} fill className="object-cover" sizes="80px" />
          </div>
        ) : null}
      </div>

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
              {c.name} <span className="opacity-70">({c.productCount})</span>
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
