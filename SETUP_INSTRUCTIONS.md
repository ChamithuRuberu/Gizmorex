# 🚀 Complete Setup Instructions for Gizmorex

## ✅ Cloudinary is Configured!

Your Cloudinary credentials are already set up:
- **Cloud Name:** yvp0ravz
- **API Key:** <your-cloudinary-api-key>
- **API Secret:** Configured ✅

---

## 📦 Step 1: Install Dependencies

Open your terminal in the Gizmorex folder and run:

```bash
npm install
```

**⏱️ This will take 2-3 minutes**

---

## 🌱 Step 2: Seed Sample Data (Optional but Recommended)

Populate your database with 8 sample products and 8 categories:

```bash
npm run seed
```

This will create:
- ✅ 8 Categories (Smartphones, Laptops, Headphones, etc.)
- ✅ 8 Sample Products with details
- ✅ Product features and specifications

---

## 🚀 Step 3: Start Development Server

```bash
npm run dev
```

Your store will be available at: **http://localhost:3000**

---

## 🎯 Step 4: Access Admin Panel

Open your browser and go to:

```
http://localhost:3000/admin
```

You should see:
- 📊 Dashboard with statistics
- 📦 8 Products ready to edit
- 📁 8 Categories created
- 🎨 All features ready!

---

## 📸 Step 5: Add Product Images

### Option A: Edit Existing Products

1. Go to: `http://localhost:3000/admin/products`
2. Click **Edit** on any product
3. **Drag & drop** your product images
4. Images will automatically upload to Cloudinary
5. Click **Save**

### Option B: Create New Product

1. Go to: `http://localhost:3000/admin/products/new`
2. Fill in product details
3. **Drag & drop** multiple images at once
4. Reorder images by dragging
5. Click **Create Product**

---

## 🖼️ Where to Get Product Images

### Free High-Quality Sources:

1. **Unsplash** - https://unsplash.com
   - Search: "smartphone", "laptop", "headphones"
   - Download size: 1920x1080 or larger

2. **Pexels** - https://pexels.com
   - Free stock photos
   - No attribution required

3. **Manufacturer Websites**
   - Apple.com → Product pages
   - Samsung.com → Download press images
   - Sony.com → Product galleries

### Image Requirements:
- ✅ Format: JPG, PNG, GIF, or WebP
- ✅ Size: Maximum 10MB per image
- ✅ Recommended: At least 1000x1000 pixels
- ✅ Multiple images: Up to 10 per product

---

## 📋 Sample Products Included

After running `npm run seed`, you'll have:

1. **Xiaomi Redmi Note 13 Pro** - LKR 89,900
2. **Sony WH-1000XM5** - LKR 79,900
3. **Xiaomi Smart Band 8** - LKR 8,990
4. **ASUS VivoBook 15** - LKR 169,900
5. **Logitech G502 HERO** - LKR 14,900
6. **Anker PowerCore 20000mAh** - LKR 12,900
7. **JBL Flip 6** - LKR 26,900
8. **70mai Dash Cam M310 Pro** - LKR 18,900

**All ready to be customized with real images!**

---

## 🎨 Features You Can Use Immediately

### Admin Panel Features:

✅ **Product Management**
- Drag & drop image upload
- Rich text editor for descriptions
- Features and specifications builder
- Category assignment
- Stock tracking
- Pricing with discounts
- Flash deals with countdown

✅ **Category Management**
- Create custom categories
- Assign colors and icons
- Sort order control
- Product count tracking

✅ **Order Management**
- View all orders
- Update order status
- Track payments
- Customer details

✅ **Customer Database**
- View all customers
- Purchase history
- Total spent tracking

✅ **Review Moderation**
- Approve/reject reviews
- Multi-language support
- Rating management

### Customer-Facing Features:

✅ **Homepage**
- Customer reviews carousel
- Flash deals section
- Featured products
- New arrivals
- Category grid
- Newsletter signup

✅ **Product Pages**
- Image gallery
- Detailed specifications
- Customer reviews
- Add to cart
- Wishlist

✅ **Shopping Flow**
- Cart management
- Checkout with Sri Lankan districts
- Cash on Delivery (COD)
- Order tracking

---

## 🔧 Configuration Files

All configuration is complete! Here's what's set:

### ✅ Environment Variables (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/gizmorex
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-64-hex>
JWT_SECRET=<random-64-hex>

# Cloudinary - CONFIGURED ✅
CLOUDINARY_CLOUD_NAME=yvp0ravz
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### ✅ Database
- MongoDB running locally or MongoDB Atlas
- Database name: `gizmorex`
- Collections: products, categories, orders, users, reviews

---

## 📸 How Image Upload Works

### Upload Flow:
```
1. You drag images → Frontend validation
2. Upload to /api/upload → Server validation
3. Forward to Cloudinary → Auto-optimization
4. Cloudinary processes:
   - Resize to 1200x1200
   - Compress (80% reduction)
   - Convert to WebP
   - Store in CDN folder: gizmorex-products/
5. Return secure URL → Display preview
6. Save to database → Product created!
```

### Benefits:
- ✅ **Fast Loading:** CDN delivery from 300+ locations
- ✅ **Optimized:** 80-90% smaller file sizes
- ✅ **Modern Format:** WebP for browsers that support it
- ✅ **Automatic:** No manual optimization needed

---

## 🧪 Testing Your Setup

### 1. Test Homepage
```
http://localhost:3000
```
**Should show:**
- Hero slider
- Category grid
- Sample products (if seeded)
- Customer reviews

### 2. Test Admin Dashboard
```
http://localhost:3000/admin
```
**Should show:**
- Statistics cards
- Recent orders
- Top products
- Quick actions

### 3. Test Image Upload
```
http://localhost:3000/admin/products/new
```
**Try:**
- Drag & drop an image
- Wait for upload (2-5 seconds)
- See image preview
- Drag to reorder images

### 4. Test Product Creation
```
1. Fill in product name
2. Click "Generate" for slug
3. Upload 3-5 images
4. Add description (rich text)
5. Set price and stock
6. Select category
7. Click "Create Product"
```

---

## 🎯 Quick Tasks to Get Started

### Task 1: Update Sample Products (10 minutes)
1. Go to `/admin/products`
2. Click **Edit** on first product
3. Upload 3-5 real product images
4. Update description if needed
5. Click **Save**
6. Repeat for other products

### Task 2: Add Your Own Product (5 minutes)
1. Go to `/admin/products/new`
2. Fill in: Name, Brand, Price
3. Drag & drop images
4. Write description
5. Add features
6. Click **Create Product**

### Task 3: Customize Categories (3 minutes)
1. Go to `/admin/categories`
2. Edit existing categories
3. Change colors
4. Update descriptions
5. Or create new ones!

### Task 4: Test Customer Flow (5 minutes)
1. Visit homepage
2. Click on a product
3. Add to cart
4. Go to checkout
5. Place test order

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Images not uploading
**Solution:**
1. Check .env.local has correct Cloudinary credentials ✅ (Already set!)
2. Restart dev server: `npm run dev`
3. Check file size < 10MB
4. Try a different image

### Issue: MongoDB connection error
**Solution:**
- Make sure MongoDB is running
- Check connection string in .env.local
- Try: `mongodb://localhost:27017/gizmorex`

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Then run again
npm run dev
```

---

## 📚 Documentation Reference

- **CLOUDINARY_SETUP.md** - Detailed Cloudinary guide
- **IMAGE_UPLOAD_FEATURES.md** - All image upload features
- **SAMPLE_PRODUCTS.md** - 20 product templates
- **QUICK_START_GUIDE.md** - Step-by-step guide
- **README.md** - Complete project documentation

---

## 🎉 You're All Set!

Your Gizmorex store is fully configured with:

✅ Cloudinary for image uploads
✅ MongoDB for data storage
✅ Sample products and categories
✅ Complete admin panel
✅ Customer-facing storefront
✅ Image optimization
✅ Sri Lankan features (LKR, districts, COD)

### Next Steps:

1. ✅ Run `npm install`
2. ✅ Run `npm run seed` (optional)
3. ✅ Run `npm run dev`
4. 📸 Start uploading product images!
5. 🚀 Customize and launch!

---

## 🆘 Need Help?

If you encounter any issues:

1. Check this guide first
2. Read the troubleshooting section
3. Check the documentation files
4. Verify .env.local configuration
5. Check console for error messages

---

**Your professional e-commerce store is ready to go! 🎉**

Start at: `http://localhost:3000/admin`
