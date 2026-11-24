import { Truck, Banknote, MessageCircle, BadgeCheck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

/** Reasons to buy, right under the hero. Clean, high-trust cards with subtle elevation. */
export default function TrustBar() {
  const items = [
    { icon: Truck, title: 'Islandwide delivery', text: `Free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
    { icon: Banknote, title: 'Cash on delivery', text: 'Pay when it arrives' },
    { icon: BadgeCheck, title: 'Original accessories', text: 'Checked before dispatch' },
    { icon: MessageCircle, title: 'WhatsApp support', text: 'Real people, quick replies' },
  ];

  return (
    <section className="bg-gray-50">
      <div className="container-custom">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {items.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-100/80 shadow-card hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-3.5 sm:px-4 py-3"
            >
              <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/60 text-primary border border-orange-100/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] sm:text-sm font-extrabold text-dark-300 leading-tight group-hover:text-primary transition-colors">
                  {title}
                </span>
                <span className="block text-[11px] sm:text-xs text-gray-500 font-medium leading-snug mt-0.5 truncate">
                  {text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
