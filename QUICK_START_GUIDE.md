# 🚀 Gizmorex Quick Start Guide

## 📋 Table of Contents
1. [Installation](#installation)
2. [Cloudinary Setup](#cloudinary-setup)
3. [First Product](#adding-your-first-product)
4. [Testing](#testing-the-store)
5. [Going Live](#going-live)

---

## 📦 Installation

### Prerequisites
```bash
✅ Node.js 18+ installed
✅ MongoDB running (local or Atlas)
✅ Git installed
```

### Step 1: Install Dependencies
```bash
cd Gizmorex
npm install
```

**⏱️ Expected Time:** 2-3 minutes

---

## ☁️ Cloudinary Setup

### Why Cloudinary?
✅ **Free Tier:** 25GB storage + 25GB bandwidth/month  
✅ **Auto-Optimization:** Images load 80% faster  
✅ **CDN:** Global delivery from 300+ locations  
✅ **No Coding:** Just copy-paste credentials  

### Step 1: Create Account (2 minutes)

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email (no credit card!)
3. Verify email

### Step 2: Get Credentials (1 minute)

After login, you'll see your **Dashboard**:

```
┌─────────────────────────────────────────┐
│   Cloudinary Dashboard                  │
├─────────────────────────────────────────┤
│                                         │
│   Cloud Name:  dxxxxxxx    📋 Copy     │
│   API Key:     123456789   📋 Copy     │
│   API Secret:  ••••••••    👁️ Reveal   │
│                                         │
└─────────────────────────────────────────┘
```

### Step 3: Update .env.local

Open `.env.local` and replace:

```env
CLOUDINARY_CLOUD_NAME=dxxxxxxx          # Your Cloud Name
CLOUDINARY_API_KEY=123456789012345      # Your API Key  
CLOUDINARY_API_SECRET=abcdef123456      # Your API Secret
```

**✅ Done!** Image uploads will now work!

---

## 📸 Adding Your First Product

### Step 1: Start the Dev Server

```bash
npm run dev
```

Server starts at: `http://localhost:3000`

### Step 2: Navigate to Admin

Open browser:
```
http://localhost:3000/admin
```

You should see:
```
┌─────────────────────────────────────────┐
│  🎯 Gizmorex Admin Dashboard           │
├─────────────────────────────────────────┤
│  📊 Total Revenue:     LKR 0           │
│  📦 Total Products:    0               │
│  🛒 Total Orders:      0               │
└─────────────────────────────────────────┘
```

### Step 3: Click "Add Product"

Or go to: `http://localhost:3000/admin/products/new`

### Step 4: Fill Basic Info

```
Product Name: *
┌──────────────────────────────────────┐
│ iPhone 15 Pro Max                    │
└──────────────────────────────────────┘

Slug: *
┌──────────────────────────────────────┐
│ iphone-15-pro-max      [Generate] ←  │ Click this!
└──────────────────────────────────────┘

Brand: *
┌──────────────────────────────────────┐
│ Apple                                │
└──────────────────────────────────────┘
```

### Step 5: Upload Images

**Drag & Drop Interface:**

```
┌──────────────────────────────────────────┐
│                                          │
│          📤  Drag & drop images          │
│                                          │
│        or click to browse                │
│                                          │
│   Supports: JPG, PNG, GIF, WebP         │
│   (Max 10MB per image)                   │
│                                          │
└──────────────────────────────────────────┘
```

**After Upload:**

```
Product Images (3/10)             Drag to reorder →

┌─────┐  ┌─────┐  ┌─────┐
│ ✕   │  │ ✕   │  │ ✕   │
│IMG 1│  │IMG 2│  │IMG 3│
│MAIN │  │     │  │     │
└─────┘  └─────┘  └─────┘
```

### Step 6: Add Pricing

```
Price (LKR): *          Original Price:
┌──────────────┐       ┌──────────────┐
│ 389900       │       │ 429900       │ ← Shows discount!
└──────────────┘       └──────────────┘

Stock: *
┌──────────────┐
│ 50           │
└──────────────┘
```

### Step 7: Select Category

```
Category: *
┌──────────────────────────────┐
│ Smartphones              ▼   │ ← Click to select
└──────────────────────────────┘
```

### Step 8: Add Description

**Rich Text Editor:**

```
┌────────────────────────────────────────┐
│ B I U ⌄  📝  🔗  •  1.              │ ← Toolbar
├────────────────────────────────────────┤
│                                        │
│  The iPhone 15 Pro Max features       │
│  the powerful A17 Pro chip...         │
│                                        │
│  Key highlights:                       │
│  • 6.7" Super Retina XDR display     │
│  • 48MP camera system                 │
│  • Titanium design                    │
│                                        │
└────────────────────────────────────────┘
```

### Step 9: Add Features (Optional)

```
Key Features
┌──────────────────────────────────────┐
│ 6.7-inch Super Retina XDR display    │ [Remove]
├──────────────────────────────────────┤
│ A17 Pro chip with 6-core GPU         │ [Remove]
├──────────────────────────────────────┤
│ 48MP Main camera system              │ [Remove]
└──────────────────────────────────────┘
                [+ Add Feature]
```

### Step 10: Save Product

```
┌──────────────────────┐  ┌──────────┐
│  💾 Create Product   │  │  Cancel  │
└──────────────────────┘  └──────────┘
        ↑ Click this!
```

**✅ Success! Your first product is live!**

---

## 🧪 Testing the Store

### View Your Product

1. Go to homepage: `http://localhost:3000`
2. You should see your product in:
   - ✅ Featured Products
   - ✅ New Arrivals
   - ✅ Category page

### Test Full Flow

```
Homepage → Product Page → Add to Cart → Checkout
```

### Admin Features to Test

```
✅ Add more products (try different categories)
✅ Create a category
✅ View dashboard stats
✅ Test image reordering (drag & drop)
✅ Edit a product
✅ Mark product as Featured
```

---

## 📊 System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Next.js Server    │
│  ┌───────────────┐  │
│  │ API Routes    │  │
│  │ /api/upload   │──┼─────→  Cloudinary CDN
│  │ /api/products │  │              │
│  └───────────────┘  │              │
└──────┬──────────────┘              │
       │                             │
       ▼                             │
┌─────────────┐                      │
│  MongoDB    │                      │
└─────────────┘                      │
                                     ▼
                              ┌──────────────┐
                              │  Optimized   │
                              │   Images     │
                              │  (WebP/JPEG) │
                              └──────────────┘
```

---

## 🎯 Image Upload Flow

```
Step 1: User drags images
        ↓
Step 2: Frontend validation (type, size)
        ↓
Step 3: Upload to /api/upload
        ↓
Step 4: Server validates again
        ↓
Step 5: Forward to Cloudinary
        ↓
Step 6: Cloudinary processes:
        • Resize to 1200x1200
        • Compress (auto quality)
        • Convert to WebP
        • Store in CDN
        ↓
Step 7: Return secure URL
        ↓
Step 8: Display preview to user
        ↓
Step 9: User can reorder (drag & drop)
        ↓
Step 10: Save URLs to product in MongoDB
```

---

## 📝 Sample Data

### Use Pre-made Products

See `SAMPLE_PRODUCTS.md` for 20 ready-to-use products:

```
✅ Smartphones (Xiaomi, Samsung, iPhone)
✅ Headphones (Sony, Haylou, JBL)  
✅ Smartwatches (Xiaomi, Haylou)
✅ Laptops (ASUS, Dell)
✅ Gaming accessories
✅ Cameras & Dash Cams
✅ Phone accessories
```

**Copy-paste product details → Add images → Done!**

---

## 🌐 Going Live

### 1. Production Environment Variables

Update `.env.local` for production:

```env
# MongoDB Atlas (production database)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gizmorex

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-strong-secret-here

# Cloudinary (same credentials work!)
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdef123456
```

### 2. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### 3. Configure Custom Domain

In Vercel dashboard:
```
Settings → Domains → Add Domain
```

### 4. Test Production

```
✅ Homepage loads
✅ Images load from Cloudinary CDN
✅ Products display correctly
✅ Admin panel accessible
✅ Image upload works
✅ Orders can be placed
```

---

## 🐛 Common Issues

### Issue: Images not uploading

**Solution:**
```bash
1. Check .env.local has correct Cloudinary credentials
2. Restart dev server (npm run dev)
3. Clear browser cache
4. Check file size < 10MB
```

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: MongoDB connection error

**Solution:**
```bash
1. Check MongoDB is running (local)
2. Or verify MongoDB Atlas connection string
3. Ensure IP whitelist includes your IP
```

### Issue: Cloudinary upload fails

**Solution:**
```bash
1. Verify API Secret is correct (no extra spaces)
2. Check Cloudinary dashboard for quota limits
3. Try different image (maybe file is corrupted)
```

---

## 💡 Pro Tips

### Fast Product Entry
1. Use `[Generate]` button for slugs
2. Copy-paste from SAMPLE_PRODUCTS.md
3. Download images in bulk from Unsplash
4. Use drag & drop for multiple images

### Image Optimization
```
Before: 2.5 MB JPEG
After:  250 KB WebP (10x smaller!)
```

### Best Image Sources
- **Unsplash.com** - Free high-quality
- **Pexels.com** - Royalty-free
- **Manufacturer sites** - Official images
- **Google Images** - Filter "Usage rights > Creative Commons"

---

## 📚 Next Steps

1. ✅ Add 10-20 products
2. ✅ Create all categories
3. ✅ Test checkout flow
4. ✅ Customize homepage
5. ✅ Add customer reviews
6. 🚀 Deploy to production!

---

## 🆘 Need Help?

- 📖 Check `CLOUDINARY_SETUP.md`
- 📸 Check `IMAGE_UPLOAD_FEATURES.md`
- 📦 Check `SAMPLE_PRODUCTS.md`
- 📝 Check `README.md`

---

**You're ready to build the next ido.lk! 🚀**
