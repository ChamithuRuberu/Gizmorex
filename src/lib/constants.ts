// Brand config
export const BRAND = {
  name: 'Gizmorex',
  tagline: 'Your Tech Universe',
  description: "Sri Lanka's premier electronics & gadgets marketplace",
  primaryColor: '#FF6B00',
  darkColor: '#3D3D3D',
  email: 'support@gizmorex.lk',
  phone: '+94 11 234 5678',
  whatsapp: '+94 71 234 5678',
  address: '123 Tech Street, Colombo 03, Sri Lanka',
};

// Categories
export const CATEGORIES = [
  { id: 'smartphones', name: 'Smartphones', slug: 'smartphones', icon: 'Smartphone', color: '#FF6B00', bg: '#FFF3E8', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80' },
  { id: 'laptops', name: 'Laptops', slug: 'laptops', icon: 'Laptop', color: '#0066CC', bg: '#E8F0FF', image: 'https://res.cloudinary.com/yvp0ravz/image/upload/v1795325296/gizmorex-products/mkkn1dpy438x5qawdzbo.jpg&q=80' },
  { id: 'audio', name: 'Audio', slug: 'audio', icon: 'Headphones', color: '#7B2D8B', bg: '#F3E8FF', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80' },
  { id: 'gaming', name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', color: '#00AA44', bg: '#E8FFE8', image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&q=80' },
  { id: 'smart-home', name: 'Smart Home', slug: 'smart-home', icon: 'Home', color: '#FF9900', bg: '#FFF8E8', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80' },
  { id: 'cameras', name: 'Cameras', slug: 'cameras', icon: 'Camera', color: '#CC2200', bg: '#FFE8E8', image: 'https://res.cloudinary.com/yvp0ravz/image/upload/v1795325303/gizmorex-products/yhzgmuhwyoxfy4kvtrez.jpg&q=80' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', icon: 'Cable', color: '#555555', bg: '#F0F0F0', image: 'https://res.cloudinary.com/yvp0ravz/image/upload/v1795325318/gizmorex-products/mkpgeotvhoqca78t0pac.jpg&q=80' },
  { id: 'wearables', name: 'Wearables', slug: 'wearables', icon: 'Watch', color: '#0099BB', bg: '#E8F8FF', image: 'https://res.cloudinary.com/yvp0ravz/image/upload/v1795325314/gizmorex-products/xfljodemkn4nhzbgwk1l.jpg&q=80' },
];

// Navigation
export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Smartphones', href: '/categories/smartphones' },
  { label: 'Laptops', href: '/categories/laptops' },
  { label: 'Audio', href: '/categories/audio' },
  { label: 'Gaming', href: '/categories/gaming' },
  { label: 'Smart Home', href: '/categories/smart-home' },
  { label: 'Cameras', href: '/categories/cameras' },
  { label: 'Accessories', href: '/categories/accessories' },
  { label: '🔥 Deals', href: '/products?deals=true' },
];

// Districts for checkout
export const SL_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

// Shipping
export const SHIPPING_COST = 350;
export const FREE_SHIPPING_THRESHOLD = 10000;

