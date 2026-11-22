import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'Gizmorex | Your Tech Universe', template: '%s | Gizmorex' },
  description: "Sri Lanka's premier electronics & gadgets marketplace. Shop smartphones, laptops, audio, gaming gear, and more.",
  keywords: ['electronics', 'gadgets', 'smartphones', 'laptops', 'Sri Lanka', 'tech store', 'gizmorex'],
  openGraph: {
    type: 'website',
    siteName: 'Gizmorex',
    title: 'Gizmorex | Your Tech Universe',
    description: "Sri Lanka's premier electronics & gadgets marketplace",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1A1A1A', color: '#fff', borderRadius: '10px', fontSize: '14px' },
            success: { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}

