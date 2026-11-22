const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Product Schema
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

// Category Schema
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  icon: { type: String, default: 'Package' },
  color: { type: String, default: '#FF6B00' },
  image: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  productCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// Sample product data with placeholder images (you can replace with real URLs)
const sampleProducts = [
  {
    name: 'Xiaomi Redmi Note 13 Pro',
    slug: 'xiaomi-redmi-note-13-pro',
    description: `<p><strong>Xiaomi Redmi Note 13 Pro</strong> - Experience flagship performance at an affordable price!</p>
    <p>Features:</p>
    <ul>
      <li>Stunning 6.67" AMOLED Display with 120Hz refresh rate</li>
      <li>Professional 200MP camera system with OIS</li>
      <li>All-day 5000mAh battery with 67W fast charging</li>
      <li>Powerful Snapdragon 7s Gen 2 processor</li>
    </ul>`,
    price: 89900,
    originalPrice: 99900,
    category: 'Smartphones',
    brand: 'Xiaomi',
    stock: 25,
    features: [
      '6.67" AMOLED Display, 120Hz',
      '200MP Main Camera with OIS',
      '5000mAh Battery with 67W Fast Charging',
      'Snapdragon 7s Gen 2',
      '8GB RAM + 256GB Storage'
    ],
    specifications: {
      'Display': '6.67" AMOLED, 2400x1080',
      'Processor': 'Snapdragon 7s Gen 2',
      'RAM': '8GB',
      'Storage': '256GB',
      'Camera': '200MP + 8MP + 2MP',
      'Battery': '5000mAh',
      'OS': 'MIUI 14'
    },
    tags: ['android', '5g', 'fast-charging', 'camera-phone'],
    isFeatured: true,
    isFlashDeal: true,
    flashDealEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5',
    description: `<p><strong>Sony WH-1000XM5</strong> - Industry-leading noise cancellation!</p>
    <p>The best noise-cancelling headphones just got better. Enjoy premium sound quality with all-day comfort.</p>`,
    price: 79900,
    originalPrice: 89900,
    category: 'Headphones',
    brand: 'Sony',
    stock: 12,
    features: [
      'Industry-Leading Noise Cancellation',
      '30-Hour Battery Life',
      'Multipoint Connection',
      'LDAC Hi-Res Audio',
      'Touch Controls'
    ],
    specifications: {
      'Driver': '30mm',
      'Battery': '30 hours',
      'Charging': 'USB-C, 3min=3hrs',
      'Weight': '250g',
      'Bluetooth': '5.2',
      'Codec': 'LDAC, AAC, SBC'
    },
    tags: ['wireless', 'noise-cancelling', 'premium', 'sony'],
    isFeatured: true,
  },
  {
    name: 'Xiaomi Smart Band 8',
    slug: 'xiaomi-smart-band-8',
    description: `<p><strong>Xiaomi Smart Band 8</strong> - Your perfect fitness companion!</p>
    <p>Track your health and fitness with 150+ sports modes and 16-day battery life.</p>`,
    price: 8990,
    originalPrice: 12990,
    category: 'Smartwatches',
    brand: 'Xiaomi',
    stock: 50,
    features: [
      '1.62" AMOLED Display',
      '16-Day Battery Life',
      '150+ Sports Modes',
      '5ATM Water Resistance',
      'Sleep & Heart Rate Monitoring'
    ],
    specifications: {
      'Display': '1.62" AMOLED',
      'Battery': '16 days',
      'Water Resistance': '5ATM',
      'Weight': '27g',
      'Connectivity': 'Bluetooth 5.1'
    },
    tags: ['fitness', 'smartwatch', 'health', 'affordable'],
    isFlashDeal: true,
    flashDealEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    name: 'ASUS VivoBook 15 X1502ZA',
    slug: 'asus-vivobook-15-x1502za',
    description: `<p><strong>ASUS VivoBook 15</strong> - Powerful performance for everyday computing!</p>
    <p>Perfect for students and professionals with Intel 12th Gen processor and fast SSD storage.</p>`,
    price: 169900,
    category: 'Laptops',
    brand: 'ASUS',
    stock: 10,
    features: [
      'Intel Core i5-12500H',
      '8GB DDR4 RAM',
      '512GB NVMe SSD',
      '15.6" FHD Display',
      'Windows 11'
    ],
    specifications: {
      'Processor': 'Intel Core i5-12500H',
      'RAM': '8GB DDR4',
      'Storage': '512GB NVMe SSD',
      'Display': '15.6" FHD',
      'Graphics': 'Intel Iris Xe',
      'OS': 'Windows 11'
    },
    tags: ['laptop', 'student', 'work', 'intel'],
    isFeatured: true,
  },
  {
    name: 'Logitech G502 HERO Gaming Mouse',
    slug: 'logitech-g502-hero',
    description: `<p><strong>Logitech G502 HERO</strong> - The legendary gaming mouse!</p>
    <p>Featuring HERO 25K sensor with 1:1 tracking, adjustable weights, and customizable RGB lighting.</p>`,
    price: 14900,
    category: 'Gaming',
    brand: 'Logitech',
    stock: 22,
    features: [
      'HERO 25K Sensor',
      '11 Programmable Buttons',
      'Adjustable Weight System',
      'RGB Lighting',
      'On-Board Memory'
    ],
    specifications: {
      'Sensor': 'HERO 25K',
      'DPI': '100-25,600',
      'Buttons': '11 programmable',
      'Weight': '121g adjustable',
      'Cable': '2.1m braided'
    },
    tags: ['gaming', 'mouse', 'rgb', 'esports'],
  },
  {
    name: 'Anker PowerCore 20000mAh Power Bank',
    slug: 'anker-powercore-20000mah',
    description: `<p><strong>Anker PowerCore 20000mAh</strong> - Charge your devices multiple times!</p>
    <p>High-capacity power bank with fast charging technology and multiple device support.</p>`,
    price: 12900,
    category: 'Accessories',
    brand: 'Anker',
    stock: 40,
    features: [
      '20000mAh Capacity',
      'Dual USB Ports',
      'PowerIQ Technology',
      'Compact Design',
      'MultiProtect Safety'
    ],
    specifications: {
      'Capacity': '20000mAh',
      'Input': '5V/2A',
      'Output': '5V/4.8A',
      'Weight': '356g',
      'Ports': '2x USB-A'
    },
    tags: ['power-bank', 'portable', 'charging', 'travel'],
  },
  {
    name: 'JBL Flip 6 Portable Speaker',
    slug: 'jbl-flip-6',
    description: `<p><strong>JBL Flip 6</strong> - Bold sound that goes anywhere!</p>
    <p>IP67 waterproof and dustproof portable speaker with 12 hours of playtime.</p>`,
    price: 26900,
    category: 'Audio',
    brand: 'JBL',
    stock: 20,
    features: [
      'IP67 Waterproof & Dustproof',
      '12 Hours Playtime',
      'PartyBoost Feature',
      'USB-C Charging',
      'Bold Sound'
    ],
    specifications: {
      'Driver': '2-way speaker',
      'Battery': '12 hours',
      'Charging': 'USB-C 2.5hrs',
      'Bluetooth': '5.1',
      'Waterproof': 'IP67'
    },
    tags: ['speaker', 'bluetooth', 'waterproof', 'outdoor'],
  },
  {
    name: '70mai Dash Cam M310 Pro',
    slug: '70mai-dash-cam-m310-pro',
    description: `<p><strong>70mai Dash Cam M310 Pro</strong> - Record your journey in crystal clear 2K!</p>
    <p>Professional dash cam with night vision, parking monitor, and built-in GPS.</p>`,
    price: 18900,
    category: 'Cameras',
    brand: '70mai',
    stock: 28,
    features: [
      '2K QHD Recording',
      '140° Wide Angle',
      'Night Vision',
      '24H Parking Monitor',
      'Built-in GPS'
    ],
    specifications: {
      'Resolution': '2K QHD',
      'Angle': '140°',
      'Screen': '2.0" IPS',
      'GPS': 'Built-in',
      'Storage': 'MicroSD up to 128GB'
    },
    tags: ['dashcam', 'car', 'safety', 'gps'],
  },
];

// Categories to create
const categories = [
  { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones and mobile devices', icon: 'Smartphone', color: '#FF6B00', sortOrder: 1 },
  { name: 'Laptops', slug: 'laptops', description: 'High-performance laptops for work and gaming', icon: 'Laptop', color: '#3B82F6', sortOrder: 2 },
  { name: 'Headphones', slug: 'headphones', description: 'Premium headphones and earbuds', icon: 'Headphones', color: '#8B5CF6', sortOrder: 3 },
  { name: 'Smartwatches', slug: 'smartwatches', description: 'Fitness trackers and smartwatches', icon: 'Watch', color: '#10B981', sortOrder: 4 },
  { name: 'Gaming', slug: 'gaming', description: 'Gaming accessories and peripherals', icon: 'Gamepad2', color: '#EF4444', sortOrder: 5 },
  { name: 'Cameras', slug: 'cameras', description: 'Cameras and photography equipment', icon: 'Camera', color: '#F59E0B', sortOrder: 6 },
  { name: 'Accessories', slug: 'accessories', description: 'Mobile and tech accessories', icon: 'Cable', color: '#06B6D4', sortOrder: 7 },
  { name: 'Audio', slug: 'audio', description: 'Speakers and audio equipment', icon: 'Speaker', color: '#EC4899', sortOrder: 8 },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Create products with placeholder images
    console.log('📦 Creating products...');
    
    const productsToCreate = [];
    
    for (const product of sampleProducts) {
      // Use simple placeholder URLs - you'll replace these with real images via admin panel
      const placeholderImages = [
        'https://placehold.co/800x800/FF6B00/FFFFFF?text=Product+Image+1',
        'https://placehold.co/800x800/3D3D3D/FFFFFF?text=Product+Image+2',
        'https://placehold.co/800x800/FF6B00/FFFFFF?text=Product+Image+3',
      ];
      
      productsToCreate.push({
        ...product,
        images: placeholderImages,
        specifications: new Map(Object.entries(product.specifications || {})),
      });
    }

    const createdProducts = await Product.insertMany(productsToCreate);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Update category product counts
    console.log('🔄 Updating category product counts...');
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category.name });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }
    console.log('✅ Updated category counts\n');

    // Display summary
    console.log('📊 Seeding Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Categories: ${createdCategories.length}`);
    console.log(`✅ Products: ${createdProducts.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/admin/products');
    console.log('3. Edit products and upload real images\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
