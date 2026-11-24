import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'cod' | 'bank' | 'directpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  /** Secret handed only to the buyer's browser, so it can poll its own payment status. */
  statusToken: string;
  paymentGateway?: 'directpay';
  gatewayTransactionId?: string;
  failureReason?: string;
  paidAt?: Date;
  trackingNumber?: string;
  notes?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    // Guest checkout: most local buyers won't create an account.
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
    }],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      district: String,
      postalCode: String,
    },
    paymentMethod: { type: String, enum: ['cod', 'bank', 'directpay'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
    orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 350 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    statusToken: { type: String, required: true, select: false },
    paymentGateway: { type: String, enum: ['directpay'] },
    gatewayTransactionId: String,
    failureReason: String,
    paidAt: Date,
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
