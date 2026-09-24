import mongoose from 'mongoose';
import Order from '../models/Order.js';

let activeOrderMemory = [
  {
    id: 'FT-8924',
    orderId: 'FT-8924',
    customerName: 'Deepak Kumar',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Valley, Sector 62, Mohali',
    status: 'placed',
    mode: 'instant',
    eta: '12 Mins',
    items: [
      { id: 'p1', name: 'Fresh Organic Tomatoes (1kg)', price: 38, qty: 1 },
      { id: 'p2', name: 'Shimla Red Apples (500g)', price: 70, qty: 1 }
    ],
    totalPaid: 108,
    paymentMethod: 'UPI',
    placedAt: '10:45 AM',
    rider: { name: 'Rahul Sharma', phone: '+91 98765 43210', rating: '4.9 ★', avatar: '👨‍🦱' }
  },
  {
    id: 'FT-8925',
    orderId: 'FT-8925',
    customerName: 'Priya Sharma',
    phone: '+91 98123 45678',
    address: 'House #120, Sector 17, Chandigarh',
    status: 'packed',
    mode: 'morning',
    eta: 'Tomorrow 7:00 AM',
    items: [
      { id: 'p7', name: 'Weekly Salad Tokri Box (2.5kg)', price: 229, qty: 1 },
      { id: 'p8', name: 'Fresh Alphonso Mangoes (1kg)', price: 195, qty: 1 }
    ],
    totalPaid: 424,
    paymentMethod: 'COD',
    placedAt: '09:15 AM',
    rider: { name: 'Vikram Singh', phone: '+91 98123 45678', rating: '4.9 ★', avatar: '🛵' }
  }
];

const formatOrder = (o) => ({
  id: o.orderId || (o._id ? o._id.toString() : o.id),
  orderId: o.orderId || (o._id ? o._id.toString() : o.id),
  customerName: o.customerName || 'Deepak Kumar',
  phone: o.phone || '+91 98765 43210',
  address: o.address || o.deliveryAddress || 'Flat 402, Green Valley, Sector 62, Mohali',
  status: o.status || 'placed',
  mode: o.mode || 'instant',
  eta: o.eta || '15-20 Mins',
  rider: o.rider || { name: 'Rahul Sharma', phone: '+91 98765 43210', rating: '4.9 ★', avatar: '👨‍🦱' },
  items: o.items || [],
  totalPaid: o.totalPaid || 0,
  paymentMethod: o.paymentMethod || 'UPI',
  deliveryAddress: o.deliveryAddress || o.address || 'Flat 402, Green Valley, Sector 62, Mohali',
  placedAt: o.placedAt || new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { items, mode, total, paymentMethod, deliveryAddress, customerName, phone } = req.body;

    const orderId = `FT-${Math.floor(1000 + Math.random() * 9000)}`;
    const eta = mode === 'instant' ? '15-20 Mins' : 'Tomorrow 6:00 AM - 9:00 AM';

    const newOrderData = {
      id: orderId,
      orderId,
      customerName: customerName || 'Deepak Kumar',
      phone: phone || '+91 98765 43210',
      address: deliveryAddress || 'Flat 402, Green Valley, Sector 62, Mohali',
      status: 'placed',
      mode: mode || 'instant',
      eta,
      rider: {
        name: 'Rahul Sharma',
        phone: '+91 98765 43210',
        rating: '4.9 ★',
        avatar: '👨‍🦱',
      },
      items: items || [],
      totalPaid: total || 0,
      paymentMethod: paymentMethod || 'UPI',
      deliveryAddress: deliveryAddress || 'Home • Sector 62, Mohali',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    activeOrderMemory.unshift(newOrderData);

    try {
      await Order.create(newOrderData);
    } catch (err) {
      console.warn('[Backend Order Warning]: DB insert failed, stored in memory', err.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrderData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active order tracking status
// @route   GET /api/orders/active
export const getActiveOrder = async (req, res, next) => {
  try {
    let order;
    try {
      order = await Order.findOne().sort({ createdAt: -1 }).lean();
    } catch {
      order = activeOrderMemory[0];
    }

    if (!order) {
      order = activeOrderMemory[0];
    }

    return res.status(200).json({
      success: true,
      data: formatOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for Admin
// @route   GET /api/orders/all
export const getAllOrders = async (req, res, next) => {
  try {
    let history = [];
    try {
      history = await Order.find().sort({ createdAt: -1 }).lean();
      if (!history || history.length === 0) history = activeOrderMemory;
    } catch {
      history = activeOrderMemory;
    }

    const formatted = history.map(formatOrder);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (placed -> packed -> on_way -> delivered)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let updated;
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId 
        ? { $or: [{ orderId: id }, { _id: id }] }
        : { orderId: id };

      updated = await Order.findOneAndUpdate(
        query,
        { $set: { status } },
        { new: true }
      ).lean();
    } catch {
      const order = activeOrderMemory.find(o => o.id === id || o.orderId === id);
      if (order) {
        order.status = status;
        updated = order;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: updated ? formatOrder(updated) : { id, status },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign rider to order
// @route   PUT /api/orders/:id/assign-rider
export const assignRider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rider } = req.body;

    let updated;
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId 
        ? { $or: [{ orderId: id }, { _id: id }] }
        : { orderId: id };

      updated = await Order.findOneAndUpdate(
        query,
        { $set: { rider, status: 'on_way' } },
        { new: true }
      ).lean();
    } catch {
      const order = activeOrderMemory.find(o => o.id === id || o.orderId === id);
      if (order) {
        order.rider = rider;
        order.status = 'on_way';
        updated = order;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Delivery rider assigned',
      data: updated ? formatOrder(updated) : { id, rider, status: 'on_way' },
    });
  } catch (error) {
    next(error);
  }
};

