import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
});

const riderSchema = new mongoose.Schema({
  name: { type: String, default: 'Rahul Sharma' },
  phone: { type: String, default: '+91 98765 43210' },
  rating: { type: String, default: '4.9 ★' },
  avatar: { type: String, default: '👨‍🦱' },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Deepak Kumar' },
    phone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'Flat 402, Green Valley, Sector 62, Mohali' },
    status: {
      type: String,
      enum: ['placed', 'packed', 'on_way', 'delivered', 'cancelled'],
      default: 'placed',
    },
    mode: {
      type: String,
      enum: ['instant', 'morning'],
      default: 'instant',
    },
    eta: { type: String, required: true },
    rider: { type: riderSchema, default: () => ({}) },
    items: [orderItemSchema],
    totalPaid: { type: Number, required: true },
    paymentMethod: { type: String, default: 'UPI' },
    deliveryAddress: { type: String, default: 'Home • Sector 62, Mohali' },
    placedAt: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;


