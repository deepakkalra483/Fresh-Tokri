/**
 * ============================================================
 *  Fresh Tokri — Product Uploader Script
 * ============================================================
 *
 *  HOW TO USE:
 *  -----------
 *  1. Add your new products in the `NEW_PRODUCTS` array below.
 *     Each product must follow the exact shape shown.
 *
 *  2. Run from your project root:
 *       npm run add-products
 *
 *  RULES:
 *  ------
 *  ✅ Products with a NEW id will be added.
 *  ⏭️  Products whose id already exists in Firestore are SKIPPED.
 *  🔒 All existing products are NEVER modified or removed.
 *
 *  CATEGORIES (use exactly as written):
 *  ─────────────────────────────────────
 *   "vegetables" | "fruits" | "exotic" | "combos" | "seasonal" | "sprouts"
 *
 *  PRODUCT FIELDS:
 *  ───────────────
 *   id           → Unique string e.g. "p20", "p21" ...
 *   name         → Full product name
 *   category     → One of the categories listed above
 *   weight       → e.g. "500 gm", "1 kg", "2 pcs"
 *   priceInstant → Instant delivery price (number, in ₹)
 *   priceMorning → Morning delivery price (number, in ₹)
 *   oldPrice     → Original/crossed-out price (number, in ₹)
 *   image        → Direct image URL (string)
 *   emoji        → One emoji character
 *   tag          → Short badge label e.g. "Farm Fresh", "Organic"
 *   discount     → e.g. "20% OFF"
 *   origin       → Source info e.g. "Direct from Mandi"
 *   description  → Short 1–2 line description
 *   inStock      → true or false
 * ============================================================
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// ── Firebase Config ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: 'AIzaSyBW3ZqpCl4qOPRhGOuVxRvtw1I5vlhgx20',
  authDomain: 'freshtokri-d17c2.firebaseapp.com',
  projectId: 'freshtokri-d17c2',
  storageBucket: 'freshtokri-d17c2.firebasestorage.app',
  messagingSenderId: '728043173885',
  appId: '1:728043173885:web:c624658a5329cf2df64b94',
};

// ── ✏️  ADD YOUR NEW PRODUCTS HERE ────────────────────────────────────────────
//
// 📌 NOTE: marketId is used by the Admin "Sync Prices" button to match
//          this product against the vegetablemarketprice.com API.
//          Do NOT change marketId once set.
//
const NEW_PRODUCTS = [
  // ── Vegetables from Bhiwani Mandi API ─────────────────────────────────────
  // Already in DB (auto-skipped): tomato(p1), spinach(p3), cucumber(p5),
  //   greenpeas(p7), brinjal(p14), capsicum(p15), lemon(p16),
  //   ginger(p17), beetroot(p18), mintleaves(p19)

  // { id: 'v-onionbig', marketId: 'onionbig', category: 'vegetables', name: 'Onion Big (Pyaaz)', weight: '1 kg', priceInstant: 50, priceMorning: 45, oldPrice: 60, emoji: '🧅', tag: 'Staple', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh big onions, best price in Bhiwani.', image: 'https://www.bbassets.com/media/uploads/p/l/40050957_6-fresho-onion-organically-grown.jpg', inStock: true },
  // { id: 'v-onionsmall', marketId: 'onionsmall', category: 'vegetables', name: 'Onion Small (Chhota Pyaaz)', weight: '1 kg', priceInstant: 68, priceMorning: 61, oldPrice: 80, emoji: '🧅', tag: 'Fresh', discount: '15% OFF', origin: 'Direct from Mandi', description: 'Small onions, great for cooking.', image: 'https://marketplace.mylamorganics.com/attachments/products/0dfbfb9cac210108d0e549dbf8e7a543.jpg', inStock: true },
  // { id: 'v-potato', marketId: 'potato', category: 'vegetables', name: 'Potato (Aloo)', weight: '1 kg', priceInstant: 28, priceMorning: 25, oldPrice: 35, emoji: '🥔', tag: 'Staple', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh potatoes, best price in Bhiwani.', image: 'https://www.bbassets.com/media/uploads/p/l/10000024_21-fresho-baby-potato.jpg', inStock: true },
  // { id: 'v-greenchili', marketId: 'greenchili', category: 'vegetables', name: 'Green Chilli (Hari Mirch)', weight: '100 gm', priceInstant: 8, priceMorning: 7, oldPrice: 10, emoji: '🌶️', tag: 'Spicy', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh green chillies, full of heat & flavour.', image: 'https://www.starquik.com/cdn/shop/files/1008708_bb85f156-1ac7-4fd6-bad0-d62df6bcd586.jpg?v=1779260037', inStock: true },
  // { id: 'v-carrot', marketId: 'carrot', category: 'vegetables', name: 'Carrot (Gajar)', weight: '500 gm', priceInstant: 20, priceMorning: 15, oldPrice: 25, emoji: '🥕', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Crunchy fresh carrots, rich in Vitamin A.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFsF_hJTxC7y2nvDkghrC6AI03jgcjjnHEO9IpS061IBox7_nfuW6OXz2W&s=10', inStock: true },
  // { id: 'v-cabbage', marketId: 'cabbage', category: 'vegetables', name: 'Cabbage (Patta Gobi)', weight: '500 gm', priceInstant: 18, priceMorning: 13, oldPrice: 22, emoji: '🥬', tag: 'Fresh', discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh tender cabbage, best price in Bhiwani.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYMCMQqJEVApWt4hRDb9x9Toj2EYRatYDZ4Fk6w7KKeRW_aLHbEZ1eFIfa&s=10', inStock: true },
  // { id: 'v-cauliflower', marketId: 'cauliflower', category: 'vegetables', name: 'Cauliflower (Phool Gobi)', weight: '500 gm', priceInstant: 22, priceMorning: 17, oldPrice: 28, emoji: '🥦', tag: 'Fresh', discount: '21% OFF', origin: 'Direct from Mandi', description: 'White fresh cauliflower, direct from mandi.', image: 'https://www.starquik.com/cdn/shop/files/1052169_PDP1_90f4d4c0-6608-499b-9354-20c8ce3e47fd.jpg?v=1779260039', inStock: true },
  // { id: 'v-ladiesfinger', marketId: 'ladiesfinger', category: 'vegetables', name: 'Ladies Finger (Bhindi)', weight: '250 gm', priceInstant: 10, priceMorning: 8, oldPrice: 13, emoji: '🫛', tag: 'Fresh', discount: '23% OFF', origin: 'Direct from Mandi', description: 'Tender bhindi, best price in Bhiwani.', image: 'https://freshbinge.sgp1.digitaloceanspaces.com/wp-content/uploads/2025/06/27143008/lady-finger-%401-2.webp', inStock: true },
  // { id: 'v-radish', marketId: 'radish', category: 'vegetables', name: 'Radish (Mooli)', weight: '500 gm', priceInstant: 18, priceMorning: 14, oldPrice: 22, emoji: '🫛', tag: 'Fresh', discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh crunchy radish, great for salads.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0e6GaLPACRGSSCW2ccq53Hw4AvtXeaw2ot5aCrEN0YVrDxRCpYWuCnjA&s=10', inStock: true },
  // { id: 'v-pumpkin', marketId: 'pumpkin', category: 'vegetables', name: 'Pumpkin (Kaddu)', weight: '500 gm', priceInstant: 12, priceMorning: 9, oldPrice: 15, emoji: '🎃', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh sweet pumpkin, direct from mandi.', image: 'https://hips.hearstapps.com/hmg-prod/images/types-of-pumpkins-68c1dfe122575.jpg?crop=0.745xw:0.994xh;0,0.00641xh&resize=1200:*', inStock: true },
  // { id: 'v-bottlegourd', marketId: 'bottlegourd', category: 'vegetables', name: 'Bottle Gourd (Lauki)', weight: '500 gm', priceInstant: 16, priceMorning: 12, oldPrice: 20, emoji: '🫙', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh lauki, light & healthy.', image: 'https://goodseeds.in/cdn/shop/files/400-600BottleGourd2.png?v=1761296897', inStock: true },
  // { id: 'v-bittergourd', marketId: 'bittergourd', category: 'vegetables', name: 'Bitter Gourd (Karela)', weight: '250 gm', priceInstant: 12, priceMorning: 9, oldPrice: 15, emoji: '🫛', tag: 'Healthy', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh bitter gourd, great for diabetics.', image: 'https://kitchenarchives.com/wp-content/uploads/2017/06/2-Bitter-Gourds.jpg', inStock: true },
  // { id: 'v-ridgegourd', marketId: 'ridgegourd', category: 'vegetables', name: 'Ridge Gourd (Tori)', weight: '500 gm', priceInstant: 22, priceMorning: 17, oldPrice: 28, emoji: '🫛', tag: 'Fresh', discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh ridge gourd, light & nutritious.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMQm5d1wJ-4uMEPS6a8mzwda_OOcxhmCTLwmc_UsjDzK-MWNzqBQ8YpGE&s=10', inStock: true },
  // { id: 'v-snakegourd', marketId: 'snakegourd', category: 'vegetables', name: 'Snake Gourd (Chichinda)', weight: '500 gm', priceInstant: 20, priceMorning: 15, oldPrice: 25, emoji: '🫛', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh snake gourd, best price in Bhiwani.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRraiU_zVz4IJo8AMOWcvdSXpnI52Me-laS82RjSJ9i5w&s=10', inStock: true },
  // { id: 'v-ivygourd', marketId: 'ivygourd', category: 'vegetables', name: 'Ivy Gourd (Kundru)', weight: '250 gm', priceInstant: 12, priceMorning: 9, oldPrice: 15, emoji: '🫛', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh tender kundru, direct from mandi.', image: 'https://goodseeds.in/cdn/shop/files/400-600Donda1.png?v=1761221269', inStock: true },
  // { id: 'v-ashgourd', marketId: 'ashgourd', category: 'vegetables', name: 'Ash Gourd (Petha)', weight: '500 gm', priceInstant: 10, priceMorning: 8, oldPrice: 13, emoji: '🫙', tag: 'Fresh', discount: '23% OFF', origin: 'Direct from Mandi', description: 'Fresh ash gourd, great for health drinks.', image: 'https://static.toiimg.com/thumb/107831804/107831804.jpg?height=746&width=420&resizemode=76&imgsize=62362', inStock: true },
  // { id: 'v-drumsticks', marketId: 'drumsticks', category: 'vegetables', name: 'Drumsticks (Sahjan)', weight: '250 gm', priceInstant: 28, priceMorning: 22, oldPrice: 35, emoji: '🌿', tag: 'Healthy', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Nutritious drumsticks, fresh from mandi.', image: 'https://t3.ftcdn.net/jpg/05/85/66/68/360_F_585666841_9PNi8WG6rn45vYLY54YZGvxLblBVkAvh.jpg', inStock: true },
  // { id: 'v-sweetpotato', marketId: 'sweetpotato', category: 'vegetables', name: 'Sweet Potato (Shakarkandi)', weight: '500 gm', priceInstant: 22, priceMorning: 17, oldPrice: 28, emoji: '🍠', tag: 'Healthy', discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh sweet potatoes, great for health.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi5mWG1vr7hRjrf4eiIvQvyeRGdTS1RtOchycSKRiPMQ&s=10', inStock: true },
  // { id: 'v-colocasia', marketId: 'colocasia', category: 'vegetables', name: 'Colocasia (Arbi)', weight: '500 gm', priceInstant: 18, priceMorning: 13, oldPrice: 22, emoji: '🥔', tag: 'Fresh', discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh arbi, best price in Bhiwani.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqA85K2zRGWJR8Xcu2usR6qy6HDPvIk_u7mRLJ43g32WJC40uSaG9cTz8&s=10', inStock: true },
  // { id: 'v-elephantyam', marketId: 'elephantyam', category: 'vegetables', name: 'Elephant Yam (Suran/Jimikand)', weight: '500 gm', priceInstant: 24, priceMorning: 18, oldPrice: 30, emoji: '🥔', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh yam, nutritious & filling.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmj9aDea8umn6x6BYnlL-OQBuRqffmtJSsL8vylh6dUw&s=10', inStock: true },
  // { id: 'v-mushroom', marketId: 'mushroom', category: 'vegetables', name: 'Mushroom', weight: '200 gm', priceInstant: 22, priceMorning: 18, oldPrice: 28, emoji: '🍄', tag: 'Premium', discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh button mushrooms, protein-rich.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5NIDRyBISkpgGzNDAKanwWnhr-s5z8nzoMOkqb70BBw&s=10', inStock: true },
  // { id: 'v-babycorn', marketId: 'babycorn', category: 'vegetables', name: 'Baby Corn', weight: '200 gm', priceInstant: 12, priceMorning: 9, oldPrice: 15, emoji: '🌽', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Tender baby corn, great for stir-fry & salads.', image: 'https://seedsnpots.com/wp-content/uploads/2021/02/baby-corn2.jpg', inStock: true },
  // { id: 'v-corn', marketId: 'corn', category: 'vegetables', name: 'Corn (Bhutta)', weight: '2 pcs', priceInstant: 15, priceMorning: 12, oldPrice: 20, emoji: '🌽', tag: 'Seasonal', discount: '25% OFF', origin: 'Direct from Mandi', description: 'Sweet fresh corn, enjoyed by all ages.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-Oiakq-8qEE2Ska62I20uauS1aPvozi4h-21uLXE9cecVUhgdmNYvBJCG&s=10', inStock: true },
  // { id: 'v-garlic', marketId: 'garlic', category: 'vegetables', name: 'Garlic (Lahsun)', weight: '100 gm', priceInstant: 18, priceMorning: 14, oldPrice: 22, emoji: '🧄', tag: 'Staple', discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh garlic, strong aroma & flavour.', image: 'https://c.ndtvimg.com/2023-09/1ulndeoo_garlic_625x300_13_September_23.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=675', inStock: true },
  // { id: 'v-oniongreen', marketId: 'oniongreen', category: 'vegetables', name: 'Green Onion (Hara Pyaaz)', weight: '100 gm', priceInstant: 8, priceMorning: 6, oldPrice: 10, emoji: '🧅', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh spring onions, great for garnishing.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkNy4PIUj4my5rrD79F_PDnkxwt9FZAnVu-IWcav0-yNJl9mGlSbMlYOK3&s=10', inStock: true },
  // { id: 'v-shallot', marketId: 'shallot', category: 'vegetables', name: 'Shallot (Pearl Onion)', weight: '250 gm', priceInstant: 14, priceMorning: 10, oldPrice: 18, emoji: '🧅', tag: 'Fresh', discount: '22% OFF', origin: 'Direct from Mandi', description: 'Small sweet shallots, great for cooking.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRusrQ5u4D3x6-1PjEPHVVPCNw8eBtL5gdqdtDPmjK4ww&s=10', inStock: true },
  // { id: 'v-broadbeans', marketId: 'broadbeans', category: 'vegetables', name: 'Broad Beans (Sem)', weight: '250 gm', priceInstant: 15, priceMorning: 11, oldPrice: 18, emoji: '🫛', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh broad beans, protein-rich & tasty.', image: 'https://www.bbassets.com/media/uploads/p/l/10000036_22-fresho-beans-broad.jpg', inStock: true },
  // { id: 'v-clusterbeans', marketId: 'clusterbeans', category: 'vegetables', name: 'Cluster Beans (Guar Phali)', weight: '250 gm', priceInstant: 15, priceMorning: 11, oldPrice: 18, emoji: '🫛', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh guar phali, full of nutrition.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8yAg9M4E71Udck7Ld7LuajNDyCQob2p-p_WONbnEVVGQmPfH_sz0JE6tp&s=10', inStock: true },
  // { id: 'v-frenchbeans', marketId: 'frenchbeans', category: 'vegetables', name: 'French Beans (Farsi Phali)', weight: '250 gm', priceInstant: 18, priceMorning: 14, oldPrice: 22, emoji: '🫛', tag: 'Fresh', discount: '18% OFF', origin: 'Direct from Mandi', description: 'Tender french beans, great for stir-fry.', image: 'https://freshindiaorganics.com/cdn/shop/files/Untitleddesign_26.png?v=1686981937', inStock: true },
  // { id: 'v-butterbeans', marketId: 'butterbeans', category: 'vegetables', name: 'Butter Beans (Sem Phali)', weight: '250 gm', priceInstant: 14, priceMorning: 10, oldPrice: 18, emoji: '🫘', tag: 'Fresh', discount: '22% OFF', origin: 'Direct from Mandi', description: 'Fresh butter beans, creamy & nutritious.', image: 'https://5.imimg.com/data5/JC/IN/MY-51202890/butter-beans-500x500.jpg', inStock: true },
  // { id: 'v-corianderleaves', marketId: 'corianderleaves', category: 'vegetables', name: 'Coriander Leaves (Dhaniya)', weight: '100 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🌿', tag: 'Fresh', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh aromatic coriander, best in Bhiwani.', image: 'https://cdn.britannica.com/95/205795-050-EF644B7F/Bowl-cilantro-leaves-coriander-fruits-Coriandrum-sativum.jpg', inStock: true },
  // { id: 'v-curryleaves', marketId: 'curryleaves', category: 'vegetables', name: 'Curry Leaves (Kadi Patta)', weight: '50 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🍃', tag: 'Fresh', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh curry leaves, full of aroma.', image: 'https://media.istockphoto.com/id/136146217/photo/curry-leaves.jpg?s=612x612&w=0&k=20&c=EWN5h9cng9yLK8FZ3uPRfjCFWQCIJwTz65NpwQgCpNA=', inStock: true },
  // { id: 'v-fenugreekleaves', marketId: 'fenugreekleaves', category: 'vegetables', name: 'Fenugreek Leaves (Methi)', weight: '100 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🌿', tag: 'Healthy', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh methi leaves, slightly bitter & healthy.', image: 'https://thevegetablebazaar.in/wp-content/uploads/2022/04/Methi.png', inStock: true },
  // { id: 'v-mustardleaves', marketId: 'mustardleaves', category: 'vegetables', name: 'Mustard Leaves (Sarson)', weight: '250 gm', priceInstant: 8, priceMorning: 6, oldPrice: 10, emoji: '🌿', tag: 'Winter', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh sarson, perfect for sarson da saag.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-IUHHokvN4JUvVC1K3Sf5fuhxitIlsV84k6_ri25SrA&s=10', inStock: true },
  // { id: 'v-dillleaves', marketId: 'dillleaves', category: 'vegetables', name: 'Dill Leaves (Suva Bhaji)', weight: '100 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🌿', tag: 'Fresh', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh dill leaves, aromatic & flavourful.', image: 'https://www.bbassets.com/media/uploads/p/l/10000106_20-fresho-dill-leaves.jpg', inStock: true },
  // { id: 'v-amaranthleaves', marketId: 'amaranthleaves', category: 'vegetables', name: 'Amaranth Leaves (Chaulai)', weight: '250 gm', priceInstant: 6, priceMorning: 4, oldPrice: 8, emoji: '🌿', tag: 'Healthy', discount: '25% OFF', origin: 'Direct from Mandi', description: 'Fresh amaranth leaves, rich in iron.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0O9rC-Q43Xz39xSFH4_nqR0mOxQ6JM0zareK9TYuLgZBnIxRAupo-bEM&s=10', inStock: true },
  // { id: 'v-colocasialeaves', marketId: 'colocasialeaves', category: 'vegetables', name: 'Colocasia Leaves (Arbi Patta)', weight: '100 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🌿', tag: 'Fresh', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh colocasia leaves, great for pakodas.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0nhY6CaoJvndJoliKV4IEHkY1iu-hZW6nIItqZ68BIeKVXUi66zFK5xvj&s=10', inStock: true },
  // { id: 'v-sorrelleaves', marketId: 'sorrelleaves', category: 'vegetables', name: 'Sorrel Leaves (Khatti Bhaji)', weight: '100 gm', priceInstant: 5, priceMorning: 4, oldPrice: 7, emoji: '🌿', tag: 'Fresh', discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh sorrel leaves, tangy & nutritious.', image: 'https://www.stylecraze.com/wp-content/uploads/2014/06/1349-19-Amazing-Health-Benefits-Of-Sorrel-Leaves-shutterstock_414241045_1200px.jpg.webp', inStock: true },
  // { id: 'v-amla', marketId: 'amla', category: 'vegetables', name: 'Amla (Indian Gooseberry)', weight: '250 gm', priceInstant: 30, priceMorning: 25, oldPrice: 38, emoji: '🍈', tag: 'Superfood', discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh amla, rich in Vitamin C.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSejSW9ONmhtGBE9EW4y1GarmyZ3CSuCm4xY0gi-h5RjJAfXGILHbsaldQ&s=10', inStock: true },
  // { id: 'v-bananaflower', marketId: 'bananaflower', category: 'vegetables', name: 'Banana Flower (Kele ka Phool)', weight: '500 gm', priceInstant: 12, priceMorning: 9, oldPrice: 15, emoji: '🌸', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh banana flower, great for curries.', image: 'https://www.bbassets.com/media/uploads/p/xl/40036723_4-fresho-banana-flower-organically-grown.jpg', inStock: true },
  // { id: 'v-plantain', marketId: 'plantain', category: 'vegetables', name: 'Raw Banana (Kachcha Kela)', weight: '500 gm', priceInstant: 6, priceMorning: 5, oldPrice: 8, emoji: '🍌', tag: 'Fresh', discount: '25% OFF', origin: 'Direct from Mandi', description: 'Green raw bananas, great for curries & fry.', image: 'https://www.bbassets.com/media/uploads/p/xl/40047709_4-fresho-banana-raw-organically-grown.jpg', inStock: true },
  // { id: 'v-mangoraw', marketId: 'mangoraw', category: 'vegetables', name: 'Raw Mango (Kacchi Keri)', weight: '250 gm', priceInstant: 28, priceMorning: 23, oldPrice: 35, emoji: '🥭', tag: 'Tangy', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Tangy raw mango, perfect for pickles & drinks.', image: 'https://www.dial4trade.com/uploaded_files/product_images/thumbs/green-mango-u-1354019229787084919.webp', inStock: true },
  // { id: 'v-brinjalbig', marketId: 'brinjalbig', category: 'vegetables', name: 'Brinjal Big (Bada Baingan)', weight: '500 gm', priceInstant: 40, priceMorning: 32, oldPrice: 50, emoji: '🍆', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Big round brinjal, great for bharwan baingan.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSimYNcB9oQy_SIedFO8QZ3VB2h3QqZ8LcmUtah3daFvpF22IXuKB25Hks&s=10', inStock: true },

  // ── Keep empty below — paste future products here ──────────────────────────
  // ── Vegetables from Bhiwani Mandi API ─────────────────────────────────────
  // Already in DB (auto-skipped): tomato(p1), spinach(p3), cucumber(p5),
  //   greenpeas(p7), brinjal(p14), capsicum(p15), lemon(p16),
  //   ginger(p17), beetroot(p18), mintleaves(p19)

  // { id: 'v-onionbig',        marketId: 'onionbig',        category: 'vegetables', name: 'Onion Big (Pyaaz)',            weight: '1 kg',   priceInstant: 50,  priceMorning: 45,  oldPrice: 60,  emoji: '🧅', tag: 'Staple',      discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh big onions, best price in Bhiwani.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Onion+Big',        inStock: true },
  // { id: 'v-onionsmall',      marketId: 'onionsmall',      category: 'vegetables', name: 'Onion Small (Chhota Pyaaz)',   weight: '1 kg',   priceInstant: 68,  priceMorning: 61,  oldPrice: 80,  emoji: '🧅', tag: 'Fresh',       discount: '15% OFF', origin: 'Direct from Mandi', description: 'Small onions, great for cooking.',               image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Onion+Small',      inStock: true },
  // { id: 'v-potato',          marketId: 'potato',          category: 'vegetables', name: 'Potato (Aloo)',                weight: '1 kg',   priceInstant: 28,  priceMorning: 25,  oldPrice: 35,  emoji: '🥔', tag: 'Staple',      discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh potatoes, best price in Bhiwani.',         image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Potato',           inStock: true },
  // { id: 'v-greenchili',      marketId: 'greenchili',      category: 'vegetables', name: 'Green Chilli (Hari Mirch)',    weight: '100 gm', priceInstant: 8,   priceMorning: 7,   oldPrice: 10,  emoji: '🌶️', tag: 'Spicy',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh green chillies, full of heat & flavour.',  image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Green+Chilli',     inStock: true },
  // { id: 'v-carrot',          marketId: 'carrot',          category: 'vegetables', name: 'Carrot (Gajar)',               weight: '500 gm', priceInstant: 20,  priceMorning: 15,  oldPrice: 25,  emoji: '🥕', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Crunchy fresh carrots, rich in Vitamin A.',      image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Carrot',           inStock: true },
  // { id: 'v-cabbage',         marketId: 'cabbage',         category: 'vegetables', name: 'Cabbage (Patta Gobi)',         weight: '500 gm', priceInstant: 18,  priceMorning: 13,  oldPrice: 22,  emoji: '🥬', tag: 'Fresh',       discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh tender cabbage, best price in Bhiwani.',   image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Cabbage',          inStock: true },
  // { id: 'v-cauliflower',     marketId: 'cauliflower',     category: 'vegetables', name: 'Cauliflower (Phool Gobi)',     weight: '500 gm', priceInstant: 22,  priceMorning: 17,  oldPrice: 28,  emoji: '🥦', tag: 'Fresh',       discount: '21% OFF', origin: 'Direct from Mandi', description: 'White fresh cauliflower, direct from mandi.',    image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Cauliflower',      inStock: true },
  // { id: 'v-ladiesfinger',    marketId: 'ladiesfinger',    category: 'vegetables', name: 'Ladies Finger (Bhindi)',       weight: '250 gm', priceInstant: 10,  priceMorning: 8,   oldPrice: 13,  emoji: '🫛', tag: 'Fresh',       discount: '23% OFF', origin: 'Direct from Mandi', description: 'Tender bhindi, best price in Bhiwani.',          image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Ladies+Finger',    inStock: true },
  // { id: 'v-radish',          marketId: 'radish',          category: 'vegetables', name: 'Radish (Mooli)',               weight: '500 gm', priceInstant: 18,  priceMorning: 14,  oldPrice: 22,  emoji: '🫛', tag: 'Fresh',       discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh crunchy radish, great for salads.',        image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Radish',           inStock: true },
  // { id: 'v-pumpkin',         marketId: 'pumpkin',         category: 'vegetables', name: 'Pumpkin (Kaddu)',              weight: '500 gm', priceInstant: 12,  priceMorning: 9,   oldPrice: 15,  emoji: '🎃', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh sweet pumpkin, direct from mandi.',        image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Pumpkin',          inStock: true },
  // { id: 'v-bottlegourd',     marketId: 'bottlegourd',     category: 'vegetables', name: 'Bottle Gourd (Lauki)',         weight: '500 gm', priceInstant: 16,  priceMorning: 12,  oldPrice: 20,  emoji: '🫙', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh lauki, light & healthy.',                  image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Bottle+Gourd',     inStock: true },
  // { id: 'v-bittergourd',     marketId: 'bittergourd',     category: 'vegetables', name: 'Bitter Gourd (Karela)',        weight: '250 gm', priceInstant: 12,  priceMorning: 9,   oldPrice: 15,  emoji: '🫛', tag: 'Healthy',     discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh bitter gourd, great for diabetics.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Bitter+Gourd',     inStock: true },
  // { id: 'v-ridgegourd',      marketId: 'ridgegourd',      category: 'vegetables', name: 'Ridge Gourd (Tori)',           weight: '500 gm', priceInstant: 22,  priceMorning: 17,  oldPrice: 28,  emoji: '🫛', tag: 'Fresh',       discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh ridge gourd, light & nutritious.',         image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Ridge+Gourd',      inStock: true },
  // { id: 'v-snakegourd',      marketId: 'snakegourd',      category: 'vegetables', name: 'Snake Gourd (Chichinda)',      weight: '500 gm', priceInstant: 20,  priceMorning: 15,  oldPrice: 25,  emoji: '🫛', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh snake gourd, best price in Bhiwani.',      image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Snake+Gourd',      inStock: true },
  // { id: 'v-ivygourd',        marketId: 'ivygourd',        category: 'vegetables', name: 'Ivy Gourd (Kundru)',           weight: '250 gm', priceInstant: 12,  priceMorning: 9,   oldPrice: 15,  emoji: '🫛', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh tender kundru, direct from mandi.',        image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Ivy+Gourd',        inStock: true },
  // { id: 'v-ashgourd',        marketId: 'ashgourd',        category: 'vegetables', name: 'Ash Gourd (Petha)',            weight: '500 gm', priceInstant: 10,  priceMorning: 8,   oldPrice: 13,  emoji: '🫙', tag: 'Fresh',       discount: '23% OFF', origin: 'Direct from Mandi', description: 'Fresh ash gourd, great for health drinks.',      image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Ash+Gourd',        inStock: true },
  // { id: 'v-drumsticks',      marketId: 'drumsticks',      category: 'vegetables', name: 'Drumsticks (Sahjan)',          weight: '250 gm', priceInstant: 28,  priceMorning: 22,  oldPrice: 35,  emoji: '🌿', tag: 'Healthy',     discount: '20% OFF', origin: 'Direct from Mandi', description: 'Nutritious drumsticks, fresh from mandi.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Drumsticks',       inStock: true },
  // { id: 'v-sweetpotato',     marketId: 'sweetpotato',     category: 'vegetables', name: 'Sweet Potato (Shakarkandi)',   weight: '500 gm', priceInstant: 22,  priceMorning: 17,  oldPrice: 28,  emoji: '🍠', tag: 'Healthy',     discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh sweet potatoes, great for health.',        image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Sweet+Potato',     inStock: true },
  // { id: 'v-colocasia',       marketId: 'colocasia',       category: 'vegetables', name: 'Colocasia (Arbi)',             weight: '500 gm', priceInstant: 18,  priceMorning: 13,  oldPrice: 22,  emoji: '🥔', tag: 'Fresh',       discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh arbi, best price in Bhiwani.',             image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Colocasia',        inStock: true },
  // { id: 'v-elephantyam',     marketId: 'elephantyam',     category: 'vegetables', name: 'Elephant Yam (Suran/Jimikand)',weight: '500 gm', priceInstant: 24,  priceMorning: 18,  oldPrice: 30,  emoji: '🥔', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh yam, nutritious & filling.',               image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Elephant+Yam',     inStock: true },
  // { id: 'v-mushroom',        marketId: 'mushroom',        category: 'vegetables', name: 'Mushroom (Khumb)',              weight: '200 gm', priceInstant: 22,  priceMorning: 18,  oldPrice: 28,  emoji: '🍄', tag: 'Premium',     discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh button mushrooms, protein-rich.',          image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Mushroom',         inStock: true },
  // { id: 'v-babycorn',        marketId: 'babycorn',        category: 'vegetables', name: 'Baby Corn (Chota Bhutta)',      weight: '200 gm', priceInstant: 12,  priceMorning: 9,   oldPrice: 15,  emoji: '🌽', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Tender baby corn, great for stir-fry & salads.', image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Baby+Corn',        inStock: true },
  // { id: 'v-corn',            marketId: 'corn',            category: 'vegetables', name: 'Corn (Bhutta)',                weight: '2 pcs',  priceInstant: 15,  priceMorning: 12,  oldPrice: 20,  emoji: '🌽', tag: 'Seasonal',    discount: '25% OFF', origin: 'Direct from Mandi', description: 'Sweet fresh corn, enjoyed by all ages.',         image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Corn',             inStock: true },
  // { id: 'v-garlic',          marketId: 'garlic',          category: 'vegetables', name: 'Garlic (Lahsun)',              weight: '100 gm', priceInstant: 18,  priceMorning: 14,  oldPrice: 22,  emoji: '🧄', tag: 'Staple',      discount: '18% OFF', origin: 'Direct from Mandi', description: 'Fresh garlic, strong aroma & flavour.',          image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Garlic',           inStock: true },
  // { id: 'v-oniongreen',      marketId: 'oniongreen',      category: 'vegetables', name: 'Green Onion (Hara Pyaaz)',     weight: '100 gm', priceInstant: 8,   priceMorning: 6,   oldPrice: 10,  emoji: '🧅', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh spring onions, great for garnishing.',     image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Green+Onion',      inStock: true },
  // { id: 'v-shallot',         marketId: 'shallot',         category: 'vegetables', name: 'Shallot (Pearl Onion)',        weight: '250 gm', priceInstant: 14,  priceMorning: 10,  oldPrice: 18,  emoji: '🧅', tag: 'Fresh',       discount: '22% OFF', origin: 'Direct from Mandi', description: 'Small sweet shallots, great for cooking.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Shallot',          inStock: true },
  // { id: 'v-broadbeans',      marketId: 'broadbeans',      category: 'vegetables', name: 'Broad Beans (Sem)',            weight: '250 gm', priceInstant: 15,  priceMorning: 11,  oldPrice: 18,  emoji: '🫛', tag: 'Fresh',       discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh broad beans, protein-rich & tasty.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Broad+Beans',      inStock: true },
  // { id: 'v-clusterbeans',    marketId: 'clusterbeans',    category: 'vegetables', name: 'Cluster Beans (Guar Phali)',   weight: '250 gm', priceInstant: 15,  priceMorning: 11,  oldPrice: 18,  emoji: '🫛', tag: 'Fresh',       discount: '17% OFF', origin: 'Direct from Mandi', description: 'Fresh guar phali, full of nutrition.',           image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Cluster+Beans',    inStock: true },
  // { id: 'v-frenchbeans',     marketId: 'frenchbeans',     category: 'vegetables', name: 'French Beans (Farsi Phali)',   weight: '250 gm', priceInstant: 18,  priceMorning: 14,  oldPrice: 22,  emoji: '🫛', tag: 'Fresh',       discount: '18% OFF', origin: 'Direct from Mandi', description: 'Tender french beans, great for stir-fry.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=French+Beans',     inStock: true },
  // { id: 'v-butterbeans',     marketId: 'butterbeans',     category: 'vegetables', name: 'Butter Beans (Sem Phali)',     weight: '250 gm', priceInstant: 14,  priceMorning: 10,  oldPrice: 18,  emoji: '🫘', tag: 'Fresh',       discount: '22% OFF', origin: 'Direct from Mandi', description: 'Fresh butter beans, creamy & nutritious.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Butter+Beans',     inStock: true },
  // { id: 'v-corianderleaves', marketId: 'corianderleaves', category: 'vegetables', name: 'Coriander Leaves (Dhaniya)',   weight: '100 gm', priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🌿', tag: 'Fresh',       discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh aromatic coriander, best in Bhiwani.',     image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Coriander',        inStock: true },
  // { id: 'v-curryleaves',     marketId: 'curryleaves',     category: 'vegetables', name: 'Curry Leaves (Kadi Patta)',    weight: '50 gm',  priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🍃', tag: 'Fresh',       discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh curry leaves, full of aroma.',             image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Curry+Leaves',     inStock: true },
  // { id: 'v-fenugreekleaves', marketId: 'fenugreekleaves', category: 'vegetables', name: 'Fenugreek Leaves (Methi)',     weight: '100 gm', priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🌿', tag: 'Healthy',     discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh methi leaves, slightly bitter & healthy.',  image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Methi',            inStock: true },
  // { id: 'v-mustardleaves',   marketId: 'mustardleaves',   category: 'vegetables', name: 'Mustard Leaves (Sarson)',      weight: '250 gm', priceInstant: 8,   priceMorning: 6,   oldPrice: 10,  emoji: '🌿', tag: 'Winter',      discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh sarson, perfect for sarson da saag.',      image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Mustard+Leaves',   inStock: true },
  // { id: 'v-dillleaves',      marketId: 'dillleaves',      category: 'vegetables', name: 'Dill Leaves (Suva Bhaji)',     weight: '100 gm', priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🌿', tag: 'Fresh',       discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh dill leaves, aromatic & flavourful.',      image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Dill+Leaves',      inStock: true },
  // { id: 'v-amaranthleaves',  marketId: 'amaranthleaves',  category: 'vegetables', name: 'Amaranth Leaves (Chaulai)',    weight: '250 gm', priceInstant: 6,   priceMorning: 4,   oldPrice: 8,   emoji: '🌿', tag: 'Healthy',     discount: '25% OFF', origin: 'Direct from Mandi', description: 'Fresh amaranth leaves, rich in iron.',           image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Amaranth+Leaves',  inStock: true },
  // { id: 'v-colocasialeaves', marketId: 'colocasialeaves', category: 'vegetables', name: 'Colocasia Leaves (Arbi Patta)',weight: '100 gm', priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🌿', tag: 'Fresh',       discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh colocasia leaves, great for pakodas.',     image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Colocasia+Leaves', inStock: true },
  // { id: 'v-sorrelleaves',    marketId: 'sorrelleaves',    category: 'vegetables', name: 'Sorrel Leaves (Khatti Bhaji)', weight: '100 gm', priceInstant: 5,   priceMorning: 4,   oldPrice: 7,   emoji: '🌿', tag: 'Fresh',       discount: '29% OFF', origin: 'Direct from Mandi', description: 'Fresh sorrel leaves, tangy & nutritious.',       image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Sorrel+Leaves',    inStock: true },
  // { id: 'v-amla',            marketId: 'amla',            category: 'vegetables', name: 'Amla (Indian Gooseberry)',     weight: '250 gm', priceInstant: 30,  priceMorning: 25,  oldPrice: 38,  emoji: '🍈', tag: 'Superfood',   discount: '21% OFF', origin: 'Direct from Mandi', description: 'Fresh amla, rich in Vitamin C.',                 image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Amla',             inStock: true },
  // { id: 'v-bananaflower',    marketId: 'bananaflower',    category: 'vegetables', name: 'Banana Flower (Kele ka Phool)',weight: '500 gm', priceInstant: 12,  priceMorning: 9,   oldPrice: 15,  emoji: '🌸', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh banana flower, great for curries.',        image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Banana+Flower',    inStock: true },
  // { id: 'v-plantain',        marketId: 'plantain',        category: 'vegetables', name: 'Raw Banana (Kachcha Kela)',    weight: '500 gm', priceInstant: 6,   priceMorning: 5,   oldPrice: 8,   emoji: '🍌', tag: 'Fresh',       discount: '25% OFF', origin: 'Direct from Mandi', description: 'Green raw bananas, great for curries & fry.',    image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Raw+Banana',       inStock: true },
  // { id: 'v-mangoraw',        marketId: 'mangoraw',        category: 'vegetables', name: 'Raw Mango (Kacchi Keri)',      weight: '250 gm', priceInstant: 28,  priceMorning: 23,  oldPrice: 35,  emoji: '🥭', tag: 'Tangy',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Tangy raw mango, perfect for pickles & drinks.', image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Raw+Mango',        inStock: true },
  // { id: 'v-brinjalbig',      marketId: 'brinjalbig',      category: 'vegetables', name: 'Brinjal Big (Bada Baingan)',   weight: '500 gm', priceInstant: 40,  priceMorning: 32,  oldPrice: 50,  emoji: '🍆', tag: 'Fresh',       discount: '20% OFF', origin: 'Direct from Mandi', description: 'Big round brinjal, great for bharwan baingan.',  image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Brinjal+Big',      inStock: true },

  // // ── Keep empty below — paste future products here ──────────────────────────
  // {
  //   "id": "p30",
  //   "name": "Avocado Hass - Tanzania",
  //   "category": "fruits",
  //   "weight": "150 gm/1Pc",
  //   "priceInstant": 92,
  //   "priceMorning": 89,
  //   "oldPrice": 99,
  //   "image": "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2025/11/20/83888f2a-e617-40e6-ae11-4c151606c1b4_VHUVWGIU65_MN_20112025.jpg",
  //   "emoji": "🥑",
  //   "tag": "Fresh",
  //   "discount": "7% OFF",
  //   "origin": "Direct from Mandi",
  //   "description": "Fresh and best price in bhiwani",
  //   "inStock": true
  // },
  // {
  //   "id": "p31",
  //   "name": "Brown Coconut (Nariyal)",
  //   "category": "fruits",
  //   "weight": "1 pc",
  //   "priceInstant": 55,
  //   "priceMorning": 49,
  //   "oldPrice": 59,
  //   "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqRpRxvLIE-7ubZfoMzlVbMgIAmPVFZAGHiFgQaExHHtMLyNu-HQ4ZM08&s=10",
  //   "emoji": "🥥",
  //   "tag": "Fresh",
  //   "discount": "7% OFF",
  //   "origin": "Direct from Mandi",
  //   "description": "Fresh and best price in bhiwani",
  //   "inStock": true
  // },
  // {
  //   "id": "p32",
  //   "name": "Kiwi",
  //   "category": "fruits",
  //   "weight": "3 pc",
  //   "priceInstant": 99,
  //   "priceMorning": 95,
  //   "oldPrice": 105,
  //   "image": "https://tropicalexotics.in/cdn/shop/files/rn-image_picker_lib_temp_28447044-fbd4-4ec1-a2f7-6d7a1f7500e0_2048x.png?v=1774817295",
  //   "emoji": "🥝",
  //   "tag": "Fresh",
  //   "discount": "6% OFF",
  //   "origin": "Direct from Mandi",
  //   "description": "Fresh and best price in bhiwani",
  //   "inStock": true
  // },
  // {
  //   "id": "p33",
  //   "name": "Nagpur Orange",
  //   "category": "fruits",
  //   "weight": "500 gm",
  //   "priceInstant": 60,
  //   "priceMorning": 55,
  //   "oldPrice": 65,
  //   "image": "https://m.media-amazon.com/images/I/311hRYQpgwL._AC_UF1000,1000_QL80_.jpg",
  //   "emoji": "🍊",
  //   "tag": "Fresh",
  //   "discount": "8% OFF",
  //   "origin": "Direct from Mandi",
  //   "description": "Fresh and best price in bhiwani",
  //   "inStock": true
  // },
  // {
  //   "id": "p34",
  //   "name": "Pineapple",
  //   "category": "fruits",
  //   "weight": "800 gm",
  //   "priceInstant": 85,
  //   "priceMorning": 79,
  //   "oldPrice": 98,
  //   "image": "https://lemoninginger.com/wp-content/uploads/2019/11/1910_StillLife_Pineapple-001-Edit.jpg",
  //   "emoji": "🍍",
  //   "tag": "Fresh",
  //   "discount": "13% OFF",
  //   "origin": "Direct from Mandi",
  //   "description": "Fresh and best price in bhiwani",
  //   "inStock": true
  // }
  // ── EXAMPLE (delete this and add your own) ───────────────────────────────

  // {
  //   id: "p20",
  //   name: "Red Onion (Pyaaz)",
  //   category: "vegetables",
  //   weight: "500 gm",
  //   priceInstant: 30,
  //   priceMorning: 25,
  //   oldPrice: 38,
  //   image: "https://your-image-url.jpg",
  //   emoji: "🧅",
  //   tag: "Staple",
  //   discount: "21% OFF",
  //   origin: "Direct from Mandi",
  //   description: "Fresh and best price in bhiwani",
  //   inStock: true,
  // },

  // ── PASTE YOUR PRODUCTS BELOW ─────────────────────────────────────────────
  // ── Newly Added Fruits from Market Price API (Excludes 6 already in DB) ────
  { id: 'f-applewashington', marketId: 'applewashington', category: 'fruits', name: 'Apple Washington (Seb)', weight: '1 kg', priceInstant: 250, priceMorning: 250, oldPrice: 280, emoji: '🍎', tag: 'Fresh', discount: '11% OFF', origin: 'Direct from Mandi', description: 'Sweet and crunchy Washington apples, premium quality.', image: 'https://placehold.co/400x400/f5f5f5/aaa?text=Apple+Washington', inStock: true },
  { id: 'f-applegreen', marketId: 'applegreen', category: 'fruits', name: 'Apple Green (Hara Seb)', weight: '1 kg', priceInstant: 310, priceMorning: 310, oldPrice: 350, emoji: '🍏', tag: 'Fresh', discount: '11% OFF', origin: 'Direct from Mandi', description: 'Crisp green Granny Smith apples, tart and refreshing.', image: 'https://www.stylecraze.com/wp-content/uploads/2013/06/Top-26-Amazing-Benefits-Of-Green-Apples-For-Skin-Hair-And-Health-1_1200px.jpg.webp', inStock: true },
  { id: 'f-cantaloupe', marketId: 'cantaloupe', category: 'fruits', name: 'Cantaloupe (Kharbuja)', weight: '1 kg', priceInstant: 50, priceMorning: 50, oldPrice: 60, emoji: '🍈', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Sweet muskmelon / cantaloupe with aromatic juicy flesh.', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Cucumis_melo_var._reticulatus_%28photo_by_Scott_Bauer%29.jpg/250px-Cucumis_melo_var._reticulatus_%28photo_by_Scott_Bauer%29.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', inStock: true },
  { id: 'f-custardapple', marketId: 'custardapple', category: 'fruits', name: 'Custard Apple (Sharifa/Sitaphal)', weight: '500 gm', priceInstant: 50, priceMorning: 50, oldPrice: 60, emoji: '🍈', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Creamy soft Sitaphal, rich seasonal delicacy.', image: 'https://www.bbassets.com/media/uploads/p/l/10000350_22-fresho-custard-apple.jpg', inStock: true },
  { id: 'f-gooseberry', marketId: 'gooseberry', category: 'fruits', name: 'Gooseberry (Amla Fruit)', weight: '250 gm', priceInstant: 40, priceMorning: 40, oldPrice: 50, emoji: '🍈', tag: 'Fresh', discount: '20% OFF', origin: 'Direct from Mandi', description: 'Fresh nutrient-rich amla fruit, powerhouse of Vitamin C.', image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Stachelbeere_%28Ribes_uva-crispa%29.jpg/250px-Stachelbeere_%28Ribes_uva-crispa%29.jpg?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail', inStock: true },
  { id: 'f-grapesblack', marketId: 'grapesblack', category: 'fruits', name: 'Grapes Black (Kala Angoor)', weight: '500 gm', priceInstant: 80, priceMorning: 80, oldPrice: 90, emoji: '🍇', tag: 'Fresh', discount: '11% OFF', origin: 'Direct from Mandi', description: 'Plump sweet black grapes, seedless and crisp.', image: 'https://ashokchakranursery.com/cdn/shop/files/black-grapes.jpg?v=1748408430', inStock: true },
  { id: 'f-grapesgreen', marketId: 'grapesgreen', category: 'fruits', name: 'Grapes Green (Hara Angoor)', weight: '500 gm', priceInstant: 90, priceMorning: 90, oldPrice: 100, emoji: '🍇', tag: 'Fresh', discount: '10% OFF', origin: 'Direct from Mandi', description: 'Juicy seedless green grapes, direct from vineyards.', image: 'https://www.bbassets.com/media/uploads/p/l/40218332_8-fresho-grapes-green.jpg', inStock: true },
  { id: 'f-guava', marketId: 'guava', category: 'fruits', name: 'Guava (Amrood)', weight: '500 gm', priceInstant: 50, priceMorning: 50, oldPrice: 60, emoji: '🍐', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Crunchy sweet Allahabad guavas, high in fibre.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCyzaHPRns1Ah-2BxXWo96ufOy1oh5CUpGOymSG0ZVazT4MOabqP4jP5C9&s=10', inStock: true },
  { id: 'f-jackfruit', marketId: 'jackfruit', category: 'fruits', name: 'Jackfruit (Kathal Fruit)', weight: '1 kg', priceInstant: 200, priceMorning: 200, oldPrice: 220, emoji: '🍈', tag: 'Fresh', discount: '9% OFF', origin: 'Direct from Mandi', description: 'Ripe sweet jackfruit bulbs, delicious traditional fruit.', image: 'https://assets1.canadiangrocer.com/s3fs-public/2024-07/11.web_images_junejuly24_655x368_aisles_4_things_jackfruit.jpg', inStock: true },
  { id: 'f-lychee', marketId: 'lychee', category: 'fruits', name: 'Lychee (Litchi)', weight: '500 gm', priceInstant: 180, priceMorning: 180, oldPrice: 200, emoji: '🍒', tag: 'Fresh', discount: '10% OFF', origin: 'Direct from Mandi', description: 'Fragrant sweet Shahi litchis, juicy and delightful.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa-Yt7UhoHXN74eCNcqVsWV4KE1dCUQttaFpV1hf02JBaSyc-VIOkfi3cN&s=10', inStock: true },
  { id: 'f-mango', marketId: 'mango', category: 'fruits', name: 'Mango (Aam)', weight: '1 kg', priceInstant: 130, priceMorning: 130, oldPrice: 150, emoji: '🥭', tag: 'Fresh', discount: '13% OFF', origin: 'Direct from Mandi', description: 'King of fruits! Juicy sweet ripe mangoes.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXHvPtSJk3m7Atjeun7eGDjqCTou7L4LcXIVIkZcFBBkqCryoXPGNVxOc&s=10', inStock: true },
  { id: 'f-papaya', marketId: 'papaya', category: 'fruits', name: 'Papaya (Papita)', weight: '1 kg', priceInstant: 70, priceMorning: 70, oldPrice: 80, emoji: '🍈', tag: 'Fresh', discount: '13% OFF', origin: 'Direct from Mandi', description: 'Sweet ripe red/yellow papaya, great for digestion.', image: 'https://tropicalexotics.in/cdn/shop/files/rn-image_picker_lib_temp_68579d65-b3ea-49c0-bab8-d5c6383f8362_2048x.png?v=1774677272', inStock: true },
  { id: 'f-pears', marketId: 'pears', category: 'fruits', name: 'Pears (Nashpati)', weight: '500 gm', priceInstant: 90, priceMorning: 90, oldPrice: 100, emoji: '🍐', tag: 'Fresh', discount: '10% OFF', origin: 'Direct from Mandi', description: 'Crisp and juicy sweet pears, rich in dietary fiber.', image: 'https://www.stylecraze.com/wp-content/uploads/2013/07/Benefits-Of-Pears_1200px.jpg.webp', inStock: true },
  { id: 'f-pomegranate', marketId: 'pomegranate', category: 'fruits', name: 'Pomegranate Kabul (Anaar)', weight: '500 gm', priceInstant: 100, priceMorning: 100, oldPrice: 110, emoji: '🍎', tag: 'Fresh', discount: '9% OFF', origin: 'Direct from Mandi', description: 'Ruby red sweet pomegranate pearls, packed with antioxidants.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbKHDi7Mx_aegRbUFzrkYKbSfTDXLYa1Pm_VdTmZt7JFHmY2ZcaM-WSIjs&s=10', inStock: true },
  { id: 'f-mosumbi', marketId: 'mosumbi', category: 'fruits', name: 'Sweet Lime (Mosumbi)', weight: '1 kg', priceInstant: 60, priceMorning: 60, oldPrice: 70, emoji: '🍋', tag: 'Fresh', discount: '14% OFF', origin: 'Direct from Mandi', description: 'Sweet and refreshing mosumbi, perfect for healthy juices.', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiSj88oC4H0jTVoeXAtQrwQbm28eVFCjt_4VOfF7CZnN0tbrIuU38dFRs&s=10', inStock: true },
  { id: 'f-watermelon', marketId: 'watermelon', category: 'fruits', name: 'Watermelon (Tarbooz)', weight: '1 pc', priceInstant: 50, priceMorning: 50, oldPrice: 60, emoji: '🍉', tag: 'Fresh', discount: '17% OFF', origin: 'Direct from Mandi', description: 'Hydrating sweet red watermelon, crisp and cooling.', image: 'https://img.magnific.com/free-photo/cut-watermelon-knife-blue-table_53876-96799.jpg?semt=ais_hybrid&w=740&q=80', inStock: true },


];

// ── Script Logic (DO NOT EDIT BELOW) ─────────────────────────────────────────
async function main() {
  if (NEW_PRODUCTS.length === 0) {
    console.log('\n⚠️  NEW_PRODUCTS list is empty!');
    console.log('   Open scripts/add-products.mjs and add your products in the NEW_PRODUCTS array.\n');
    process.exit(0);
  }

  // Validate all products have required fields
  const REQUIRED_FIELDS = ['id', 'name', 'category', 'weight', 'priceInstant', 'priceMorning', 'oldPrice', 'image', 'emoji', 'tag', 'discount', 'origin', 'description', 'inStock'];
  const VALID_CATEGORIES = ['vegetables', 'fruits', 'exotic', 'combos', 'seasonal', 'sprouts'];

  for (const p of NEW_PRODUCTS) {
    const missing = REQUIRED_FIELDS.filter(f => p[f] === undefined || p[f] === '');
    if (missing.length > 0) {
      console.error(`\n❌ Product "${p.name || p.id}" is missing fields: ${missing.join(', ')}`);
      process.exit(1);
    }
    if (!VALID_CATEGORIES.includes(p.category)) {
      console.error(`\n❌ Product "${p.name}" has invalid category: "${p.category}"`);
      console.error(`   Valid categories: ${VALID_CATEGORIES.join(', ')}`);
      process.exit(1);
    }
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const INVENTORY_DOC = doc(db, 'inventory', 'menu');

  console.log('\n📥 Fetching existing inventory from Firestore...');
  const snap = await getDoc(INVENTORY_DOC);

  const existingMenu = snap.exists() ? snap.data().menu : {};

  // Build a set of all existing product IDs
  const existingIds = new Set(
    Object.values(existingMenu).flat().map(p => p.id)
  );

  const totalExisting = existingIds.size;
  console.log(`✅ Found ${totalExisting} existing products across categories: [${Object.keys(existingMenu).join(', ')}]`);
  console.log(`\n🔄 Processing ${NEW_PRODUCTS.length} product(s) from your list...\n`);

  const updatedMenu = { ...existingMenu };
  let addedCount = 0;
  let skippedCount = 0;

  for (const product of NEW_PRODUCTS) {
    const { category, ...productData } = product;

    if (existingIds.has(product.id)) {
      console.log(`   ⏭️  SKIP  — "${product.name}" (id: ${product.id}) already exists`);
      skippedCount++;
      continue;
    }

    if (!updatedMenu[category]) {
      updatedMenu[category] = [];
    }

    updatedMenu[category].push(productData);
    existingIds.add(product.id);
    console.log(`   ✅ ADD   — "${product.name}" → [${category}]`);
    addedCount++;
  }

  if (addedCount === 0) {
    console.log('\n🟡 Nothing new to add. All product IDs already exist in Firestore.');
    process.exit(0);
  }

  console.log(`\n💾 Saving to Firestore...`);
  await setDoc(INVENTORY_DOC, {
    menu: updatedMenu,
    updatedAt: serverTimestamp(),
  });

  console.log(`\n🎉 Upload complete!`);
  console.log(`   ✅ Added:   ${addedCount} new product(s)`);
  console.log(`   ⏭️  Skipped: ${skippedCount} (already existed — untouched)`);
  console.log(`   🔒 Existing ${totalExisting} products were NOT modified.\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Script failed:', err.message || err);
  process.exit(1);
});

