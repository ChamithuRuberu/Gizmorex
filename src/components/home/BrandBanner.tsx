export default function BrandBanner() {
  const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'ASUS', 'JBL', 'Razer', 'Google', 'Xiaomi', 'Anker'];
  return (
    <section className="py-6">
      <div className="container-custom">
        <h2 className="section-title text-center mb-5">Top Brands</h2>
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {brands.map(brand => (
              <div
                key={brand}
                className="flex-shrink-0 px-6 py-3 bg-gray-50 hover:bg-orange-50 rounded-xl text-gray-500 hover:text-primary font-bold text-sm transition-all cursor-pointer whitespace-nowrap border border-transparent hover:border-primary/20"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

