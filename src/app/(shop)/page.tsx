import HomeHero from '@/components/home/HomeHero';
import TrustBar from '@/components/home/TrustBar';
import FlashSale from '@/components/home/FlashSale';
import PromoBand from '@/components/home/PromoBand';
import CategoryRows from '@/components/home/CategoryRows';
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
    <div className="bg-gray-50 min-h-screen flex flex-col gap-4 sm:gap-5 pb-12">
      <HomeHero categories={data.categories} banners={data.banners} />
      <TrustBar />
      <FlashSale products={data.flashDeals} />
      <PromoBand maxDiscount={data.maxDiscount} promoBanners={data.promoBanners} />
      <CategoryRows rows={data.rows} />
      <JustForYou products={forYou} categories={data.categories} />
      <BrandStrip brands={data.brands} />
    </div>
  );
}
