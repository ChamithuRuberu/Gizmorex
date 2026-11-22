/**
 * Legal Product Creation Script
 * This creates products using:
 * - Public manufacturer specifications
 * - Placeholder images (you replace with legal images)
 * - Original descriptions
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  price: Number,
  originalPrice: Number,
  images: [String],
  category: String,
  brand: String,
  stock: Number,
  sold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  features: [String],
  specifications: { type: Map, of: String },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isFlashDeal: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  flashDealEndsAt: Date,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Placeholder image URL - You should replace these with your own images
const PLACEHOLDER_BASE = 'https://via.placeholder.com';

const sampleProducts = [
  {
    name: 'Smartphone Pro X',
    slug: 'smartphone-pro-x',
    description: '<p>Experience next-generation mobile technology with advanced features and superior performance.</p>',
    price: 89900,
    originalPrice: 99900,
    category: 'Smartphones',
    brand: 'TechBrand',
    stock: 25,
    features: [
      '6.7" High-Resolution Display',
      'Advanced Camera System',
      'All-Day Battery Life',
      'Fast Processor',
      'Large Storage Capacity'
    ],
    specifications: {
      'Display': '6.7 inches',
      'Processor': 'Octa-core',
      'RAM': '8GB',
      'Storage': '256GB',
      'Camera': 'Triple Camera',
      'Battery': '5000mAh'
    },
    tags: ['smartphone', 'android', '5g'],
    images: [
      `${PLACEHOLDER_BASE}/800x800/FF6B00/FFFFFF?text=Main+Image`,
      `${PLACEHOLDER_BASE}/800x800/3D3D3D/FFFFFF?text=Side+View`,
      `${PLACEHOLDER_BASE}/800x800/FF6B00/FFFFFF?text=Back+View`,
    ],
    isFeatured: true,
    isFlashDeal: true,
    flashDealEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Wireless Headphones Elite',
    slug: 'wireless-headphones-elite',
    description: '<p>Premium audio quality with advanced noise cancellation technology for immersive listening.</p>',
    price: 79900,
    originalPrice: 89900,
    category: 'Headphones',
    brand: 'AudioTech',
    stock: 15,
    features: [
      'Active Noise Cancellation',
      'Long Battery Life',
      'Comfortable Design',
      'High-Quality Audio',
      'Wireless Connectivity'
    ],
    specifications: {
      'Driver': '40mm',
      'Battery': '30 hours',
      'Connectivity': 'Bluetooth 5.2',
      'Weight': '250g',
      'Charging': 'USB-C'
    },
    tags: ['headphones', 'wireless', 'noise-cancelling'],
    images: [
      `${PLACEHOLDER_BASE}/800x800/8B5CF6/FFFFFF?text=Headphones+Main`,
      `${PLACEHOLDER_BASE}/800x800/8B5CF6/FFFFFF?text=Side+View`,
      `${PLACEHOLDER_BASE}/800x800/8B5CF6/FFFFFF?text=Worn+View`,
    ],
    isFeatured: true,
  },
  // Add more products as needed
];

async function createProducts() {
  try {
    console.log('🌱 Creating sample products with placeholder images...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products\n');

    // Create products
    const created = await Product.insertMany(sampleProducts.map(p => ({
      ...p,
      specifications: new Map(Object.entries(p.specifications)),
    })));

    console.log(`✅ Created ${created.length} sample products\n`);
    console.log('📝 IMPORTANT: These products use placeholder images.\n');
    console.log('Please replace them with your own legal images:\n');
    console.log('1. Go to http://localhost:3000/admin/products');
    console.log('2. Click Edit on each product');
    console.log('3. Upload your own images from:');
    console.log('   - Unsplash.com');
    console.log('   - Pexels.com');
    console.log('   - Your own photos');
    console.log('   - Manufacturer press images\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createProducts();
