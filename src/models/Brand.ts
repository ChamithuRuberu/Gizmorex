import mongoose, { Schema, Document } from 'mongoose';

/**
 * Brand display settings (logo, order). Products keep the brand as plain text;
 * this collection only adds a logo for brands you choose to show.
 */
export interface IBrand extends Document {
  name: string;
  /** Lower-case name, used to match products' `brand` text. */
  key: string;
  logo: string;
  isActive: boolean;
  sortOrder: number;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default (mongoose.models.Brand as mongoose.Model<IBrand>) || mongoose.model<IBrand>('Brand', BrandSchema);
