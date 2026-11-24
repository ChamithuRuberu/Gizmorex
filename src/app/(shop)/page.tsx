import DarazHero from '@/components/home/DarazHero';
import DarazChannels from '@/components/home/DarazChannels';
import DarazFlashSale from '@/components/home/DarazFlashSale';
import GizmoMall from '@/components/home/GizmoMall';
import CategoryGrid from '@/components/home/CategoryGrid';
import PromoBanners from '@/components/home/PromoBanners';
import JustForYou from '@/components/home/JustForYou';
import BrandBanner from '@/components/home/BrandBanner';
import CustomerReviews from '@/components/home/CustomerReviews';
import Newsletter from '@/components/home/Newsletter';
import { getHomeData } from '@/lib/catalog';

// Always read the live catalog so admin changes show immediately.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomeData();

  // "Just For You": deals and featured first, then the newest products, no duplicates.
  const uniqueJustForYou = Array.from(
    new Map([...data.flashDeals, ...data.featured, ...data.latest].map((p) => [p._id, p])).values()
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col space-y-2 pb-12">
      {/* 1. Daraz Hero: Category Sidebar + Main Carousel + Welcome & Voucher Widget */}
      <DarazHero categories={data.categories} />

      {/* 2. Daraz Quick Access Channels Bar (Flash Sale, GizmoMall, Free Delivery, Voucher, COD) */}
      <DarazChannels />

      {/* 3. Daraz Flash Sale Section with Countdown Timer & Claim Progress */}
      <DarazFlashSale products={data.flashDeals} />

      {/* 4. GizmoMall Official Brand Stores (100% Authentic with Guarantees) */}
      <GizmoMall />

      {/* 5. Categories Grid (Daraz 2-Row Grid with Category Photos) */}
      <CategoryGrid categories={data.categories} />

      {/* 6. Promotional Campaign Banners */}
      <PromoBanners />

      {/* 7. Daraz "Just For You" Infinite Recommendations Feed with Category Tabs */}
      <JustForYou products={uniqueJustForYou} categories={data.categories} />

      {/* 8. Official Brand Partners Banner */}
      <BrandBanner />

      {/* 9. Verified Customer Reviews */}
      <CustomerReviews />

      {/* 10. Welcome Voucher Newsletter */}
      <Newsletter />
    </div>
  );
}
