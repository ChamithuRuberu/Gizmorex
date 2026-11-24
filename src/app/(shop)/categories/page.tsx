import type { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryTree } from '@/lib/catalog';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CategoryIcon from '@/components/ui/CategoryIcon';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'All Categories | Gizmorex' };

export default async function CategoriesPage() {
  const { tree } = await getCategoryTree();
  const categories = tree.filter((c) => c.productCount > 0);

  return (
    <div className="container-custom py-6">
      <Breadcrumb items={[{ label: 'Categories' }]} />
      <h1 className="text-3xl font-black text-dark-300 mb-6">All Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <section key={cat.slug} className="bg-white rounded-2xl border border-gray-100 p-5">
            <Link href={`/categories/${cat.slug}`} className="flex items-center gap-3 group">
              <span className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <CategoryIcon name={cat.icon} className="w-5 h-5 text-primary" />
              </span>
              <span>
                <span className="block font-bold text-dark-300 group-hover:text-primary">{cat.name}</span>
                <span className="text-xs text-gray-500">{cat.productCount} products</span>
              </span>
            </Link>
            <ul className="mt-4 space-y-1.5">
              {cat.children
                ?.filter((c) => c.productCount > 0)
                .map((sub) => (
                  <li key={sub.slug}>
                    <Link href={`/categories/${sub.slug}`} className="flex justify-between text-sm text-gray-600 hover:text-primary">
                      <span>{sub.name}</span>
                      <span className="text-gray-400">{sub.productCount}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
