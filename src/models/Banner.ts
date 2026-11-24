import mongoose, { Schema, Document } from 'mongoose';

/** Home page banner (hero slide or middle promo block), managed in Admin → Banners. */
export interface IBanner extends Document {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
  position?: 'hero' | 'promo-1' | 'promo-2' | 'promo';
  isActive: boolean;
  sortOrder: number;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    image: { type: String, required: true },
    link: { type: String, default: '/products', trim: true },
    buttonText: { type: String, default: 'Shop now', trim: true },
    position: { type: String, default: 'hero', enum: ['hero', 'promo-1', 'promo-2', 'promo'] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

export default (mongoose.models.Banner as mongoose.Model<IBanner>) || mongoose.model<IBanner>('Banner', BannerSchema);
