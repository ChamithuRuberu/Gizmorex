# Gizmorex — Premier Electronics & Gadgets Store ⚡

Gizmorex is a **full-featured, production-ready e-commerce platform** inspired by **ido.lk**, built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **MongoDB**.

---

## 🎨 Brand Identity & Theme
- **Brand Name:** Gizmorex
- **Brand Colors:**
  - **GIZMO (Orange):** `#FF6B00`
  - **REX (Dark Charcoal):** `#3D3D3D`
- **Logo:** Located in `public/logo.jpg` (used across Header, Auth, and Admin).

---

## 🚀 Key Features

### 🛍️ Customer-Facing Storefront

#### Home Page Experience (Like ido.lk)

#### Home Page Experience (Like ido.lk)
- **Top Announcement Bar:** Rotating promotional alerts (free shipping, 24/7 WhatsApp support, cash-on-delivery).
- **Sticky Header:**
  - Brand logo with responsive sizing
  - Full-width search bar with category dropdown
  - Wishlist counter badge
  - Slide-out Cart Drawer with real-time updates & free shipping progress bar
  - User account quick menu
- **Interactive Hero Carousel:** High-impact slides with call-to-actions & side promotional banners.
- **Shop by Category Grid:** 8 dedicated tech categories with custom icons and color accents.
- **⚡ Flash Deals with Live Countdown:** Real-time countdown timer and discounted gadgets.
- **Featured Products & Best Sellers:** Filterable grids with discount badges and quick-actions on hover.
- **New Arrivals with Category Tabs:** Switch between All, Smartphones, Laptops, Audio, Gaming.
- **Customer Reviews Carousel:** 🌟 Real customer testimonials with 5-star ratings, verified purchase badges, and multi-language support (English & Sinhala)
- **Newsletter Subscription:** Interactive subscription section with instant feedback.
- **Comprehensive 4-Column Footer:** About, quick links, category links, Sri Lankan address, and WhatsApp contact button.

#### 📦 E-Commerce Flow
- **Product Details (`/products/[slug]`):** Multi-image gallery, specs accordion, warranty badges, quantity picker, wishlist toggle, customer reviews section, and related products.
- **Products Catalog (`/products`):** Price range slider, brand checkboxes, category filters, and sorting.
- **Cart & Slide-out Drawer (`/cart`):** Full quantity manipulation, live subtotal, and free shipping calculation.
- **Checkout (`/checkout`):** Sri Lankan district dropdown, Cash on Delivery (COD), Card & Bank transfer payment options, and instant order confirmation screen.
- **Orders History (`/orders`):** Order tracking with status badges (Pending, Processing, Shipped, Delivered).
- **Wishlist (`/wishlist`):** Dedicated page to view and move saved gadgets to cart.
- **User Account (`/account`):** Profile details and shipping address management.
- **Authentication:** Login (`/login`) & Register (`/register`) pages with secure password hashing.

#### ⭐ Review System
- **Customer Reviews:** 5-star rating system with detailed comments
- **Multi-language Support:** English and Sinhala reviews
- **Verified Purchase Badges:** Shows which reviews are from actual customers
- **Review Moderation:** Admin approval system before reviews go live

### 🛡️ Comprehensive Admin Dashboard (`/admin`)

#### 📸 Advanced Image Upload System
- **Drag & Drop Multiple Images** - Upload up to 10 images per product
- **Visual Reordering** - Drag to reorder images, first image becomes main
- **Auto-Optimization** - Cloudinary integration for CDN delivery
  - Auto-resize to 1200x1200px
  - Smart compression (80-90% size reduction)
  - WebP format for modern browsers
  - JPEG fallback for compatibility
- **Real-time Preview** - See images immediately after upload
- **Delete on Hover** - Easy image removal
- **Progress Indicators** - Visual upload feedback
- **File Validation** - Type and size checks (max 10MB)

#### ✍️ Rich Content Editor
- **Quill.js Integration** - Professional text editor
- **Text Formatting** - Bold, italic, underline, colors
- **Structured Content** - Headers, lists, links
- **Clean HTML Output** - SEO-friendly markup

#### Dashboard Overview
- **Real-time Statistics:**
  - Total Revenue (all-time earnings)
  - Total Orders (with pending count)
  - Total Products (with low stock alerts)
  - Total Customers
- **Visual Analytics:**
  - Revenue by month (last 6 months)
  - Recent orders list
  - Top selling products
- **Quick Actions:** One-click access to add products, manage orders, categories, and reviews

#### Product Management (`/admin/products`)
- ✅ **Modern Image Upload Interface**
  - Drag & drop multiple images
  - Reorder with drag & drop
  - Automatic optimization via Cloudinary CDN
  - Real-time preview and management
- ✅ **Rich Text Editor** for descriptions
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Advanced search and filtering
  - Search by name, brand, or tags
  - Filter by status (active, inactive, low-stock)
  - Filter by category
- ✅ Product inventory tracking with low-stock alerts
- ✅ Bulk actions support
- ✅ Image management
- ✅ SEO-friendly slug generation
- ✅ Featured products toggle
- ✅ Flash deals management with countdown timers

#### Category Management (`/admin/categories`)
- ✅ Create and manage product categories
- ✅ Custom icons and color themes per category
- ✅ Sort order control
- ✅ Active/inactive status toggle
- ✅ Automatic product count tracking
- ✅ Slug generation for SEO
- ✅ Category description support

#### Order Management (`/admin/orders`)
- ✅ Comprehensive order listing with filters
  - Search by order number, customer name, or phone
  - Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- ✅ Order detail modal view
  - Full customer information
  - Order items with images
  - Delivery address
  - Payment method and status
- ✅ One-click status updates
- ✅ Order tracking integration
- ✅ Payment status management
- ✅ Order notes and internal comments

#### Customer Management (`/admin/customers`)
- ✅ Complete customer database
- ✅ Customer search functionality
- ✅ Purchase history per customer
- ✅ Total spent tracking
- ✅ Registration date tracking
- ✅ Contact information management

#### Review Moderation (`/admin/reviews`)
- ✅ Review approval system
  - Pending reviews queue
  - One-click approve/reject
- ✅ Filter reviews by status (all, pending, approved)
- ✅ Review deletion with product rating recalculation
- ✅ Verified purchase indicator
- ✅ Multi-language review display
- ✅ Product association view with thumbnails

---

## 📂 Project Structure

```
Gizmorex/
├── public/
│   └── logo.jpg               # Official Gizmorex logo
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register
│   │   ├── (shop)/            # Storefront, Products, Categories, Cart, Checkout, Orders, Wishlist
│   │   ├── admin/             # Complete Admin Dashboard
│   │   │   ├── page.tsx       # Dashboard with real-time stats
│   │   │   ├── products/      # Product management
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Order management
│   │   │   ├── customers/     # Customer database
│   │   │   └── reviews/       # Review moderation
│   │   ├── api/               # API routes
│   │   │   ├── products/      # Product CRUD operations
│   │   │   ├── categories/    # Category management
│   │   │   ├── orders/        # Order management
│   │   │   ├── reviews/       # Review system
│   │   │   ├── auth/          # Authentication
│   │   │   └── admin/         # Admin-specific APIs
│   │   │       ├── stats/     # Dashboard statistics
│   │   │       ├── products/  # Admin product management
│   │   │       ├── categories/# Admin category management
│   │   │       ├── orders/    # Admin order management
│   │   │       ├── customers/ # Customer management
│   │   │       └── reviews/   # Review moderation
│   │   ├── globals.css        # Tailwind & custom brand styling
│   │   └── layout.tsx         # Root layout with Toast provider
│   ├── components/
│   │   ├── home/              # Homepage components
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── FlashDeals.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── NewArrivals.tsx
│   │   │   ├── CustomerReviews.tsx  # 🌟 NEW: Reviews carousel
│   │   │   └── Newsletter.tsx
│   │   ├── layout/            # Header, Footer, Navbar, CartDrawer
│   │   ├── products/          # ProductCard
│   │   └── ui/                # StarRating, Breadcrumb, Pagination, Modal
│   ├── lib/
│   │   ├── constants.ts       # Brand data, categories, districts
│   │   ├── data.ts            # Seed data (Apple, Samsung, Sony, ASUS, etc.)
│   │   ├── mongodb.ts         # Mongoose connection utility
│   │   └── utils.ts           # Currency formatter (LKR), utilities
│   ├── models/                # Mongoose schemas
│   │   ├── Product.ts         # Product model with reviews
│   │   ├── User.ts            # User model with wishlist
│   │   ├── Order.ts           # Order model with tracking
│   │   ├── Review.ts          # 🌟 NEW: Review model
│   │   └── Category.ts        # 🌟 NEW: Category model
│   ├── store/                 # Zustand stores
│   │   ├── cartStore.ts       # Cart with LocalStorage
│   │   └── wishlistStore.ts   # Wishlist management
│   └── types/                 # TypeScript interfaces
│       └── index.ts           # Extended with AdminStats, Review types
├── .env.local                 # MongoDB connection string
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 What Makes This Like ido.lk

### Matching ido.lk Features:

1. ✅ **Customer Review System** - Just like ido.lk's prominent customer testimonials
2. ✅ **Multi-language Support** - English and Sinhala reviews (like ido.lk)
3. ✅ **Verified Purchase Badges** - Shows authentic customer reviews
4. ✅ **5-Star Rating Display** - Prominent rating system
5. ✅ **Fast Delivery Focus** - Emphasis on quick delivery times
6. ✅ **Competitive Pricing** - Price comparison features
7. ✅ **Customer Service** - WhatsApp support integration
8. ✅ **Sri Lankan Context** - Districts, LKR currency, COD payment
9. ✅ **Electronics Focus** - Gadgets, smartphones, accessories
10. ✅ **Trust Indicators** - Review carousel on homepage

### Admin Panel Features (Beyond ido.lk):

- **Complete Dashboard** with real-time analytics
- **Category Management** for organizing products
- **Customer Database** with purchase history
- **Review Moderation** system
- **Order Tracking** with status updates
- **Inventory Management** with low-stock alerts
- **Search & Filter** across all sections

---

## 🏃 Running the Application

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

### Setup

1. **Clone the repository**
```bash
cd Gizmorex
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create `.env.local` file:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary for Image Uploads (Free tier: 25GB/month)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get Cloudinary Credentials:**
- Sign up at [cloudinary.com](https://cloudinary.com/users/register_free) (free)
- Copy credentials from dashboard
- See `CLOUDINARY_SETUP.md` for detailed guide

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

### Admin Access
- Navigate to `/admin` to access the admin dashboard
- Add your first product at `/admin/products/new`
- Full product, category, order, customer, and review management

---

## 📸 Image Upload System

### Features
- **Drag & Drop:** Upload multiple images at once
- **Reordering:** Drag to reorder, first = main image
- **Optimization:** Auto-resize, compress, CDN delivery
- **Supported:** JPG, PNG, GIF, WebP (max 10MB each)

### Quick Start
1. Set up Cloudinary account (free, 5 minutes)
2. Add credentials to `.env.local`
3. Upload images at `/admin/products/new`

See `CLOUDINARY_SETUP.md` and `IMAGE_UPLOAD_FEATURES.md` for details.

---

## 📦 Sample Products

20 ready-to-use product templates inspired by ido.lk:
- Smartphones (Xiaomi, Samsung, iPhone)
- Headphones (Sony, Haylou, JBL)
- Smartwatches (Xiaomi Band, Haylou)
- Gaming accessories (Logitech, Razer)
- Cameras & Dash Cams (70mai, GoPro)
- Laptops (ASUS, Dell)
- Accessories (Anker, Baseus, Ugreen)

See `SAMPLE_PRODUCTS.md` for full list with prices and features.

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT authentication with next-auth
- ✅ Protected admin routes
- ✅ Input validation on all forms
- ✅ XSS protection
- ✅ CSRF protection with next-auth

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimization
- ✅ Desktop layouts
- ✅ Touch-friendly interfaces
- ✅ Responsive images with Next.js Image

---

## 🚀 Performance Optimizations

- ✅ Next.js 15 App Router for optimal performance
- ✅ Server-side rendering (SSR)
- ✅ Static generation where possible
- ✅ Image optimization with Next.js Image
- ✅ Code splitting and lazy loading
- ✅ MongoDB indexing for fast queries
- ✅ Debounced search inputs
- ✅ Optimistic UI updates

---

## 🎨 UI/UX Highlights

- Modern gradient-based design
- Smooth animations and transitions
- Toast notifications for user feedback
- Loading states and skeletons
- Error handling with user-friendly messages
- Accessible components (ARIA labels)
- Intuitive navigation
- Visual feedback on all actions

---

## 📊 API Endpoints

### Public APIs
- `GET /api/products` - Get all products with filters
- `GET /api/products/[id]` - Get single product
- `GET /api/categories` - Get all categories
- `GET /api/reviews?productId=` - Get product reviews
- `POST /api/reviews` - Create new review

### Admin APIs
- `GET /api/admin/stats` - Dashboard statistics
- `GET/POST /api/admin/products` - Manage products
- `PATCH/DELETE /api/admin/products/[id]` - Update/delete product
- `GET/POST /api/admin/categories` - Manage categories
- `PATCH/DELETE /api/admin/categories/[id]` - Update/delete category
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/[id]` - Update order status
- `GET /api/admin/customers` - Get all customers
- `GET /api/admin/reviews` - Get all reviews
- `PATCH/DELETE /api/admin/reviews/[id]` - Approve/delete review

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS, Custom CSS
- **State Management:** Zustand
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js v5
- **Image Upload:** Cloudinary CDN, React Dropzone
- **Drag & Drop:** @dnd-kit/core, @dnd-kit/sortable
- **Rich Text:** React Quill (Quill.js)
- **UI Components:** Lucide React Icons
- **Notifications:** React Hot Toast
- **Image Carousel:** Swiper.js

---

## 📁 Additional Documentation

- `CLOUDINARY_SETUP.md` - Step-by-step Cloudinary setup guide
- `IMAGE_UPLOAD_FEATURES.md` - Complete image upload system documentation
- `SAMPLE_PRODUCTS.md` - 20 ready-to-use product templates

---

## 📝 License

This project is built as an e-commerce template inspired by ido.lk's user experience.

