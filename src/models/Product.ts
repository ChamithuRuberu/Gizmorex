import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  features: string[];
  specifications: Map<string, string>;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isFlashDeal: boolean;
  isNewArrival?: boolean;
  flashDealEndsAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    features: [{ type: String }],
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFlashDeal: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },
    flashDealEndsAt: { type: Date },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isFlashDeal: 1 });

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);

