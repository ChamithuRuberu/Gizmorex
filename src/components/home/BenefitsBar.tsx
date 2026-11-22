import { Truck, ShieldCheck, Banknote, RotateCcw, Headphones } from 'lucide-react';

export default function BenefitsBar() {
  const benefits = [
    {
      icon: Truck,
      title: 'Islandwide Free Delivery',
      desc: 'On all orders above Rs. 10,000',
    },
    {
      icon: Banknote,
      title: 'Cash on Delivery (COD)',
      desc: 'Pay at your doorstep safely',
    },
    {
      icon: ShieldCheck,
      title: '100% Genuine Tech',
      desc: 'Official company warranty',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Returns',
      desc: 'Hassle-free replacement policy',
    },
    {
      icon: Headphones,
      title: '24/7 Expert Support',
      desc: 'WhatsApp & phone hotline',
    },
  ];

  return (
    <section className="py-4 border-y border-gray-100 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50/50 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-dark-300 truncate">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
