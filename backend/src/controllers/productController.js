import mongoose from 'mongoose';
import Product from '../models/Product.js';

// In-memory fallback dataset in case MongoDB is offline
const fallbackProducts = [
  { id: 'p1', productId: 'p1', name: 'Fresh Organic Farm Tomatoes', weight: '1 kg', category: 'vegetables', priceInstant: 48, priceMorning: 38, oldPrice: 55, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80', emoji: '🍅', tag: 'Farm Fresh', discount: '20% OFF', origin: 'Sourced 4 AM from Malwa Organic Farms', description: 'Hand-picked ruby red tomatoes. Grown naturally without synthetic pesticides. Perfect for curries, salads, and fresh juices.', inStock: true },
  { id: 'p2', productId: 'p2', name: 'Shimla Red Royal Apples', weight: '500 g', category: 'fruits', priceInstant: 90, priceMorning: 70, oldPrice: 110, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', emoji: '🍎', tag: 'Crispy', discount: '22% OFF', origin: 'Direct Orchard Sourced from Kinnaur, HP', description: 'Sweet, juicy, and extra crunchy red apples. Rich in fiber and natural antioxidants.', inStock: true },
  { id: 'p3', productId: 'p3', name: 'Baby Leaf Spinach (Palak)', weight: '250 g', category: 'vegetables', priceInstant: 25, priceMorning: 18, oldPrice: 32, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', emoji: '🥬', tag: 'Direct Pick', discount: '28% OFF', origin: 'Local Hydroponic Greenhouse', description: 'Triple-washed tender spinach leaves. Packed with iron, folate, and essential minerals.', inStock: true },
  { id: 'p4', productId: 'p4', name: 'Robusta Ripe Bananas', weight: '1 Dozen', category: 'fruits', priceInstant: 60, priceMorning: 48, oldPrice: 75, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80', emoji: '🍌', tag: 'Potassium', discount: '20% OFF', origin: 'Kerala Certified Farmers Co-op', description: 'Naturally ripened nutrient-dense bananas. High energy snack for active daily lifestyle.', inStock: true },
  { id: 'p5', productId: 'p5', name: 'Crispy Green Cucumbers', weight: '500 g', category: 'vegetables', priceInstant: 30, priceMorning: 22, oldPrice: 38, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80', emoji: '🥒', tag: 'Cooling', discount: '26% OFF', origin: 'Polyhouse Fresh Harvest', description: 'Thin-skinned hydrative cucumbers. Great for detox salads and summer cooling.', inStock: true },
  { id: 'p6', productId: 'p6', name: 'Organic Green Broccoli', weight: '1 Pc (400g)', category: 'exotic', priceInstant: 85, priceMorning: 65, oldPrice: 105, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', emoji: '🥦', tag: 'Organic', discount: '24% OFF', origin: 'Himalayan Organic Belts', description: 'Dense green vitamin-rich broccoli florets. Superfood for immune boosting.', inStock: true },
  { id: 'p7', productId: 'p7', name: 'Weekly Salad Tokri Box', weight: '2.5 kg Box', category: 'combos', priceInstant: 299, priceMorning: 229, oldPrice: 380, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', emoji: '🥗', tag: 'Super Saver', discount: '23% OFF', origin: 'Fresh Tokri Custom Combo', description: 'Curated box containing Tomatoes, Cucumbers, Onions, Carrots, and Green Chillies.', inStock: true },
  { id: 'p8', productId: 'p8', name: 'Fresh Alphonso Mangoes', weight: '1 kg', category: 'fruits', priceInstant: 250, priceMorning: 195, oldPrice: 320, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80', emoji: '🥭', tag: 'Seasonal', discount: '22% OFF', origin: 'Ratnagiri Geographical Indication Farms', description: 'King of Mangoes. Aromatic, rich saffron pulp with heavenly sweetness.', inStock: true },
  { id: 'p9', productId: 'p9', name: 'Nasik Red Onions', weight: '1 kg', category: 'vegetables', priceInstant: 35, priceMorning: 28, oldPrice: 42, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400&q=80', emoji: '🧅', tag: 'Staple', discount: '20% OFF', origin: 'Nasik Direct Mandi Sourced', description: 'Pungent, crisp red onions. Essential staple for all Indian cooking recipes.', inStock: true },
  { id: 'p10', productId: 'p10', name: 'Fresh Yellow Potatoes', weight: '1 kg', category: 'vegetables', priceInstant: 32, priceMorning: 24, oldPrice: 40, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', emoji: '🥔', tag: 'Fresh Batch', discount: '25% OFF', origin: 'Jalandhar Agri Farms', description: 'Firm skin, low moisture potatoes. Ideal for boiling, frying, and roasting.', inStock: true }
];

// Helper to format product document for frontend consumption
const formatProduct = (p) => ({
  id: p.productId || (p._id ? p._id.toString() : p.id),
  productId: p.productId || (p._id ? p._id.toString() : p.id),
  name: p.name,
  weight: p.weight,
  category: p.category,
  priceInstant: p.priceInstant,
  priceMorning: p.priceMorning,
  oldPrice: p.oldPrice,
  image: p.image,
  emoji: p.emoji || '🥬',
  tag: p.tag || 'Farm Fresh',
  discount: p.discount || '20% OFF',
  origin: p.origin || 'Direct Punjab Farm Sourced',
  description: p.description || '',
  inStock: p.inStock ?? true
});

// @desc    Get all produce products
// @route   GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let products = [];

    try {
      const filter = {};
      if (category && category !== 'all') filter.category = category;
      if (search) filter.name = { $regex: search, $options: 'i' };

      // Auto-seed initial produce items if MongoDB collection is empty
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('[Product Controller]: Auto-seeding initial produce items into MongoDB...');
        await Product.insertMany(fallbackProducts.map(p => ({
          productId: p.productId || p.id,
          name: p.name,
          weight: p.weight,
          category: p.category,
          priceInstant: p.priceInstant,
          priceMorning: p.priceMorning,
          oldPrice: p.oldPrice,
          image: p.image,
          emoji: p.emoji,
          tag: p.tag,
          discount: p.discount,
          origin: p.origin,
          description: p.description,
          inStock: p.inStock
        })));
      }

      products = await Product.find(filter).lean();
      if (!products || products.length === 0) {
        products = fallbackProducts;
      }
    } catch (err) {
      console.warn('[Backend Product Warning]: MongoDB query failed, returning fallback products.', err.message);
      products = fallbackProducts;
    }

    let result = products.map(formatProduct);

    if (category && category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId 
        ? { $or: [{ productId: id }, { _id: id }] }
        : { productId: id };

      product = await Product.findOne(query).lean();
    } catch {
      product = fallbackProducts.find(p => p.id === id || p.productId === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produce item not found' });
    }

    return res.status(200).json({ success: true, data: formatProduct(product) });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new produce item
// @route   POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const productId = req.body.id || req.body.productId || `p-${Date.now()}`;
    const productData = {
      productId,
      name: req.body.name,
      weight: req.body.weight || '1 kg',
      category: req.body.category || 'vegetables',
      priceInstant: Number(req.body.priceInstant) || 40,
      priceMorning: Number(req.body.priceMorning) || 32,
      oldPrice: Number(req.body.oldPrice) || 50,
      image: req.body.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
      emoji: req.body.emoji || '🥬',
      tag: req.body.tag || 'Farm Fresh',
      discount: req.body.discount || '20% OFF',
      origin: req.body.origin || 'Direct Punjab Farm Sourced',
      description: req.body.description || 'Fresh organic farm produce.',
      inStock: true,
    };

    let createdDoc;
    try {
      createdDoc = await Product.create(productData);
    } catch (err) {
      console.warn('[Backend Product Warning]: Failed creating product in MongoDB, using fallback list', err.message);
      fallbackProducts.unshift({ id: productId, ...productData });
    }

    const returnData = createdDoc ? formatProduct(createdDoc.toObject()) : { id: productId, ...productData };

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: returnData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update produce item
// @route   PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let updated;

    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId 
        ? { $or: [{ productId: id }, { _id: id }] }
        : { productId: id };

      updated = await Product.findOneAndUpdate(
        query,
        { $set: req.body },
        { new: true }
      ).lean();

      // If product didn't exist in MongoDB yet, create it!
      if (!updated && mongoose.connection.readyState === 1) {
        const newProductData = {
          productId: id.startsWith('p') ? id : `p-${Date.now()}`,
          name: req.body.name,
          weight: req.body.weight || '1 kg',
          category: req.body.category || 'vegetables',
          priceInstant: Number(req.body.priceInstant) || 40,
          priceMorning: Number(req.body.priceMorning) || 32,
          oldPrice: Number(req.body.oldPrice) || 50,
          image: req.body.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
          emoji: req.body.emoji || '🥬',
          tag: req.body.tag || 'Farm Fresh',
          discount: req.body.discount || '20% OFF',
          origin: req.body.origin || 'Direct Punjab Farm Sourced',
          description: req.body.description || 'Fresh organic farm produce.',
          inStock: req.body.inStock ?? true,
          ...req.body
        };
        const createdDoc = await Product.create(newProductData);
        updated = createdDoc.toObject();
      }
    } catch (err) {
      console.warn('[Backend Product Warning]: MongoDB update failed, updating fallback list', err.message);
      const idx = fallbackProducts.findIndex(p => p.id === id || p.productId === id);
      if (idx !== -1) {
        fallbackProducts[idx] = { ...fallbackProducts[idx], ...req.body };
        updated = fallbackProducts[idx];
      }
    }

    const returnData = updated ? formatProduct(updated) : { id, ...req.body };

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: returnData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete produce item
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId 
        ? { $or: [{ productId: id }, { _id: id }] }
        : { productId: id };

      await Product.deleteOne(query);
    } catch (err) {
      console.warn('[Backend Product Warning]: MongoDB delete failed, removing from fallback list', err.message);
      const idx = fallbackProducts.findIndex(p => p.id === id || p.productId === id);
      if (idx !== -1) fallbackProducts.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      id,
    });
  } catch (error) {
    next(error);
  }
};

