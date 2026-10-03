import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

const PRODUCTS_COLLECTION = 'products';

// Seed data — only written when collection is empty
const SEED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Super Fresh Organic Tomatoes',
    weight: '1 kg',
    category: 'vegetables',
    priceInstant: 55,
    priceMorning: 38,
    oldPrice: 65,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
    emoji: '🍅',
    tag: 'Farm Fresh',
    discount: '20% OFF',
    origin: 'Sourced 4 AM from Malwa Organic Farms',
    description: 'Hand-picked ruby red tomatoes. Grown naturally without synthetic pesticides.',
    inStock: true,
  },
  {
    id: 'p2',
    name: 'Shimla Red Royal Apples',
    weight: '500 g',
    category: 'fruits',
    priceInstant: 90,
    priceMorning: 70,
    oldPrice: 110,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
    emoji: '🍎',
    tag: 'Crispy',
    discount: '22% OFF',
    origin: 'Direct Orchard Sourced from Kinnaur, HP',
    description: 'Sweet juicy crunchy red apples. Rich in fiber and antioxidants.',
    inStock: true,
  },
  {
    id: 'p3',
    name: 'Baby Leaf Spinach (Palak)',
    weight: '250 g',
    category: 'vegetables',
    priceInstant: 25,
    priceMorning: 18,
    oldPrice: 32,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    emoji: '🥬',
    tag: 'Direct Pick',
    discount: '28% OFF',
    origin: 'Local Hydroponic Greenhouse',
    description: 'Triple-washed tender spinach leaves. Packed with iron and folate.',
    inStock: true,
  },
  {
    id: 'p4',
    name: 'Robusta Ripe Bananas',
    weight: '1 Dozen',
    category: 'fruits',
    priceInstant: 60,
    priceMorning: 48,
    oldPrice: 75,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
    emoji: '🍌',
    tag: 'Potassium',
    discount: '20% OFF',
    origin: 'Kerala Certified Farmers Co-op',
    description: 'Naturally ripened nutrient-dense bananas.',
    inStock: true,
  },
  {
    id: 'p5',
    name: 'Crispy Green Cucumbers',
    weight: '500 g',
    category: 'vegetables',
    priceInstant: 30,
    priceMorning: 22,
    oldPrice: 38,
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&q=80',
    emoji: '🥒',
    tag: 'Cooling',
    discount: '26% OFF',
    origin: 'Polyhouse Fresh Harvest',
    description: 'Thin-skinned hydrative cucumbers. Great for detox salads.',
    inStock: true,
  },
  {
    id: 'p6',
    name: 'Organic Green Broccoli',
    weight: '1 Pc (400g)',
    category: 'exotic',
    priceInstant: 85,
    priceMorning: 65,
    oldPrice: 105,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80',
    emoji: '🥦',
    tag: 'Organic',
    discount: '24% OFF',
    origin: 'Himalayan Organic Belts',
    description: 'Dense green vitamin-rich broccoli florets. Superfood for immunity.',
    inStock: true,
  },
  {
    id: 'p7',
    name: 'Weekly Salad Tokri Box',
    weight: '2.5 kg Box',
    category: 'combos',
    priceInstant: 299,
    priceMorning: 229,
    oldPrice: 380,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    emoji: '🥗',
    tag: 'Super Saver',
    discount: '23% OFF',
    origin: 'Fresh Tokri Custom Combo',
    description: 'Curated box with Tomatoes, Cucumbers, Onions, Carrots, Green Chillies.',
    inStock: true,
  },
  {
    id: 'p8',
    name: 'Fresh Alphonso Mangoes',
    weight: '1 kg',
    category: 'fruits',
    priceInstant: 250,
    priceMorning: 195,
    oldPrice: 320,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80',
    emoji: '🥭',
    tag: 'Seasonal',
    discount: '22% OFF',
    origin: 'Ratnagiri GI Farms',
    description: 'King of Mangoes. Aromatic rich saffron pulp.',
    inStock: true,
  },
  {
    id: 'p9',
    name: 'Nasik Red Onions',
    weight: '1 kg',
    category: 'vegetables',
    priceInstant: 35,
    priceMorning: 28,
    oldPrice: 42,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=400&q=80',
    emoji: '🧅',
    tag: 'Staple',
    discount: '20% OFF',
    origin: 'Nasik Direct Mandi Sourced',
    description: 'Pungent crisp red onions. Essential for all Indian cooking.',
    inStock: true,
  },
  {
    id: 'p10',
    name: 'Fresh Yellow Potatoes',
    weight: '1 kg',
    category: 'vegetables',
    priceInstant: 32,
    priceMorning: 24,
    oldPrice: 40,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    emoji: '🥔',
    tag: 'Fresh Batch',
    discount: '25% OFF',
    origin: 'Jalandhar Agri Farms',
    description: 'Firm skin low moisture potatoes. Ideal for boiling and frying.',
    inStock: true,
  },
];

/**
 * Fetch all products from Firestore.
 * Returns an array of product objects (each with an `id` field).
 */
export const fetchProductsFromFirestore = async () => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.warn('[productService] fetchProductsFromFirestore error:', err.message);
    return null;
  }
};

/**
 * Create a new product document in Firestore (auto-generated ID).
 * Returns the created product including the generated `id`.
 */
export const createProductInFirestore = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
    return { id: docRef.id, ...productData };
  } catch (err) {
    console.warn('[productService] createProductInFirestore error:', err.message);
    return null;
  }
};

/**
 * Update an existing product document in Firestore.
 * Returns the merged product object on success.
 */
export const updateProductInFirestore = async (id, productData) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, productData);
    return { id, ...productData };
  } catch (err) {
    console.warn('[productService] updateProductInFirestore error:', err.message);
    return null;
  }
};

/**
 * Delete a product document from Firestore by ID.
 */
export const deleteProductInFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (err) {
    console.warn('[productService] deleteProductInFirestore error:', err.message);
  }
};

/**
 * Seeds the products collection with 10 default products if it is empty.
 * Uses setDoc with explicit IDs so seeding is idempotent.
 */
export const seedProductsIfEmpty = async () => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snapshot.size > 0) return; // Already has data — skip seeding

    const writes = SEED_PRODUCTS.map(({ id, ...data }) =>
      setDoc(doc(db, PRODUCTS_COLLECTION, id), data)
    );
    await Promise.all(writes);
    console.info('[productService] Seeded', SEED_PRODUCTS.length, 'products into Firestore.');
  } catch (err) {
    console.warn('[productService] seedProductsIfEmpty error:', err.message);
  }
};
