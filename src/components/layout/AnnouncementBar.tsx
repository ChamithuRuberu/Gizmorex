'use client';
import { useEffect, useState } from 'react';

const ANNOUNCEMENTS = [
  '🚚 Free shipping on orders over Rs. 10,000 islandwide!',
  '📱 24/7 Customer Support via WhatsApp: +94 71 234 5678',
  '🔒 100% Secure Payments | Cash on Delivery Available',
  '⚡ Flash Deals every day — Don\'t miss out!',
  '🎁 Free gifts on orders above Rs. 25,000',
];

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-white py-2 text-center text-sm font-medium overflow-hidden">
      <div key={current} className="animate-fade-in">
        {ANNOUNCEMENTS[current]}
      </div>
    </div>
  );
}

