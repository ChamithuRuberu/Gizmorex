import mongoose, { Schema, Document } from 'mongoose';

/** Home page hero slide, managed in Admin → Banners. */
export interface IBanner extends Document {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  buttonText: string;
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
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BannerSchema.index({ isActive: 1, sortOrder: 1 });

export default (mongoose.models.Banner as mongoose.Model<IBanner>) || mongoose.model<IBanner>('Banner', BannerSchema);
