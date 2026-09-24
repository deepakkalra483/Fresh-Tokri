import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    weight: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['vegetables', 'fruits', 'exotic', 'combos', 'seasonal', 'sprouts', 'leafies', 'flowers'] 
    },
    priceInstant: { type: Number, required: true },
    priceMorning: { type: Number, required: true },
    oldPrice: { type: Number },
    image: { type: String, required: true },
    emoji: { type: String, default: '🥬' },
    tag: { type: String, default: 'Farm Fresh' },
    discount: { type: String, default: '20% OFF' },
    origin: { type: String, default: 'Direct Punjab Farm Sourced' },
    description: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;

