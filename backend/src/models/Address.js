import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    addressId: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    flat: { type: String, required: true },
    area: { type: String, required: true },
    tag: { type: String, default: 'HOME' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;

