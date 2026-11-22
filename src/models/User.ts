import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'user' | 'admin';
  phone?: string;
  addresses: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  wishlist: string[];
}

const AddressSchema = new Schema({
  id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  district: String,
  postalCode: String,
  isDefault: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String },
    addresses: [AddressSchema],
    wishlist: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);

