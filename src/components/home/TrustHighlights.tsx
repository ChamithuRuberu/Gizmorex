import { ShieldCheck, Truck, Headphones, Award, Star } from 'lucide-react';

export default function TrustHighlights() {
  const stats = [
    {
      value: '50,000+',
      label: 'Delivered Orders',
      sub: 'Across all 25 districts in Sri Lanka',
    },
    {
      value: '100%',
      label: 'Genuine Guarantee',
      sub: 'Authentic products with official warranty',
    },
    {
      value: '4.9 / 5',
      label: 'Customer Rating',
      sub: 'Over 2,500+ verified customer reviews',
    },
    {
      value: '24 Hours',
      label: 'Fast Dispatch',
      sub: 'Same-day delivery in Western Province',
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-primary mb-2">
            <Award className="w-3.5 h-3.5" /> Sri Lanka's Trusted Tech Store
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-dark-300">
            Why Thousands Choose Gizmorex
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            We bridge direct manufacturers and tech lovers with genuine products, fair pricing, and transparent warranties.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary/20 hover:shadow-card transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl font-black text-primary mb-1">
                {s.value}
              </div>
              <h4 className="text-sm font-bold text-dark-300 mb-1">{s.label}</h4>
              <p className="text-xs text-gray-500 leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
