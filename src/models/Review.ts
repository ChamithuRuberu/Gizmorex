import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  likes: number;
  language: 'en' | 'si';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    language: { type: String, enum: ['en', 'si'], default: 'en' },
  },
  { timestamps: true }
);

// Index for efficient queries
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.models.Review ||
  mongoose.model<IReview>('Review', ReviewSchema);
