import { Truck, Banknote, MessageCircle, BadgeCheck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

/** Reasons to buy, right under the hero. Only promises the shop actually makes. */
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
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-2.5 sm:gap-3 bg-white rounded-2xl border border-gray-100 px-3 sm:px-4 py-3">
              <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] sm:text-sm font-bold text-dark-300 leading-tight">{title}</span>
                <span className="block text-[11px] sm:text-xs text-gray-500 leading-snug mt-0.5">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
