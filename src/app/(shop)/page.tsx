import HomeHero from '@/components/home/HomeHero';
import FlashSale from '@/components/home/FlashSale';
import CategoryGrid from '@/components/home/CategoryGrid';
import JustForYou from '@/components/home/JustForYou';
import BrandStrip from '@/components/home/BrandStrip';
import { getHomeData } from '@/lib/catalog';

// Everything on this page comes from MongoDB, so admin changes show on the next visit.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomeData();

  // Deals and featured first, then the newest products, no duplicates.
  const forYou = Array.from(
    new Map([...data.flashDeals, ...data.featured, ...data.latest].map((p) => [p._id, p])).values()
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col space-y-2 pb-12">
      <HomeHero categories={data.categories} banners={data.banners} />
      <FlashSale products={data.flashDeals} />
      <CategoryGrid categories={data.categories} />
      <JustForYou products={forYou} categories={data.categories} />
      <BrandStrip brands={data.brands} />
    </div>
  );
}
