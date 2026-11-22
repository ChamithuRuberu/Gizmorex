'use client';
import { useState } from 'react';
import { Mail, Send, Sparkles, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setCouponCode('GIZMO1000');
    toast.success('Welcome! Use code GIZMO1000 for Rs. 1,000 off!', {
      duration: 6000,
      icon: '🎉',
    });
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        <div className="bg-gradient-to-br from-primary via-orange-600 to-primary-700 rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-xl">
          {/* Decorative blurred circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-24 -translate-x-24 pointer-events-none" />

          <div className="relative max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-4 text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Exclusive Welcome Offer
            </span>

            <h2 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight">
              Get Rs. 1,000 OFF Your First Order!
            </h2>
            <p className="text-white/85 text-sm sm:text-base mb-8 leading-relaxed">
              Join 15,000+ tech lovers in Sri Lanka. Receive private flash sales, gadget reviews, and immediate discount vouchers directly in your inbox.
            </p>

            {couponCode ? (
              <div className="bg-white/15 border border-white/30 backdrop-blur-md rounded-2xl p-5 max-w-md mx-auto animate-fade-in">
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold block mb-1">
                  Your Welcome Promo Code:
                </span>
                <div className="flex items-center justify-center gap-2 text-2xl font-black tracking-widest text-yellow-300 font-mono">
                  <Tag className="w-5 h-5" /> {couponCode}
                </div>
                <p className="text-[11px] text-white/75 mt-2">
                  Apply at checkout for Rs. 1,000 discount on orders over Rs. 15,000.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full px-4 py-3.5 pl-11 rounded-xl text-dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/80 shadow-inner bg-white"
                    required
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-dark-500 hover:bg-dark-400 text-white font-bold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-75 whitespace-nowrap text-sm"
                >
                  {loading ? 'Subscribing...' : (<><Send className="w-4 h-4" /> Claim Rs. 1,000</>)}
                </button>
              </form>
            )}

            <p className="text-white/60 text-xs mt-4">
              🔒 We respect your privacy. No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
