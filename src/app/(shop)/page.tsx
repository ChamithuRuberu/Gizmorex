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
import { getLiveLandingData } from '@/lib/store-data';

export const revalidate = 60; // Revalidate dynamic landing data every 60 seconds

export default async function HomePage() {
  const data = await getLiveLandingData();

  // Display full catalog in "Just For You" recommendation feed
  const justForYouProducts = data.allProducts && data.allProducts.length > 0
    ? data.allProducts
    : [
        ...(data.flashDeals || []),
        ...(data.featured || []),
        ...(data.newArrivals || []),
      ];

  // Deduplicate by _id
  const uniqueJustForYou = Array.from(
    new Map(justForYouProducts.map((p) => [p._id, p])).values()
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
      <JustForYou products={uniqueJustForYou} />

      {/* 8. Official Brand Partners Banner */}
      <BrandBanner />

      {/* 9. Verified Customer Reviews */}
      <CustomerReviews />

      {/* 10. Welcome Voucher Newsletter */}
      <Newsletter />
    </div>
  );
}
