/**
 * sync-missing-vegs.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches the full vegetable list from Bhiwani Mandi API,
 * compares with Firebase inventory, and adds any missing vegetables.
 *
 * ✅ Already in DB (by marketId) → SKIPPED
 * ➕ In API but missing from DB  → ADDED with placeholder image
 * 🔒 Fruits and other categories → UNTOUCHED
 *
 * Run from project root:
 *   node scripts/sync-missing-vegs.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBW3ZqpCl4qOPRhGOuVxRvtw1I5vlhgx20',
  authDomain: 'freshtokri-d17c2.firebaseapp.com',
  projectId: 'freshtokri-d17c2',
  storageBucket: 'freshtokri-d17c2.firebasestorage.app',
  messagingSenderId: '728043173885',
  appId: '1:728043173885:web:c624658a5329cf2df64b94',
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Emoji map for known vegetables ────────────────────────────────────────────
const EMOJI_MAP = {
  tomato: '🍅', beetroot: '🫜', capsicum: '🫑', cucumber: '🥒',
  brinjal: '🍆', brinjalbig: '🍆', ginger: '🫚', greenpeas: '🫛',
  lemon: '🍋', mintleaves: '🌿', spinach: '🥬', onionbig: '🧅',
  onionsmall: '🧅', oniongreen: '🧅', potato: '🥔', greenchili: '🌶️',
  carrot: '🥕', cabbage: '🥬', cauliflower: '🥦', ladiesfinger: '🫛',
  radish: '🫛', pumpkin: '🎃', bottlegourd: '🫙', bittergourd: '🫛',
  ridgegourd: '🫛', snakegourd: '🫛', ivygourd: '🫛', ashgourd: '🫙',
  drumsticks: '🌿', sweetpotato: '🍠', colocasia: '🥔', elephantyam: '🥔',
  mushroom: '🍄', babycorn: '🌽', corn: '🌽', garlic: '🧄',
  shallot: '🧅', broadbeans: '🫛', clusterbeans: '🫛', frenchbeans: '🫛',
  butterbeans: '🫘', corianderleaves: '🌿', curryleaves: '🍃',
  fenugreekleaves: '🌿', mustardleaves: '🌿', dillleaves: '🌿',
  amaranthleaves: '🌿', colocasialeaves: '🌿', sorrelleaves: '🌿',
  amla: '🍈', bananaflower: '🌸', plantain: '🍌', mangoraw: '🥭',
};

// ── Hindi name map for known vegetables ───────────────────────────────────────
const HINDI_MAP = {
  tomato: 'Tamatar', beetroot: 'Chukandar', capsicum: 'Shimla Mirch',
  cucumber: 'Kheera', brinjal: 'Baingan', brinjalbig: 'Bada Baingan',
  ginger: 'Adrak', greenpeas: 'Matar', lemon: 'Nimbu', mintleaves: 'Pudina',
  spinach: 'Palak', onionbig: 'Pyaaz', onionsmall: 'Chhota Pyaaz',
  oniongreen: 'Hara Pyaaz', potato: 'Aloo', greenchili: 'Hari Mirch',
  carrot: 'Gajar', cabbage: 'Patta Gobi', cauliflower: 'Phool Gobi',
  ladiesfinger: 'Bhindi', radish: 'Mooli', pumpkin: 'Kaddu',
  bottlegourd: 'Lauki', bittergourd: 'Karela', ridgegourd: 'Tori',
  snakegourd: 'Chichinda', ivygourd: 'Kundru', ashgourd: 'Petha',
  drumsticks: 'Sahjan', sweetpotato: 'Shakarkandi', colocasia: 'Arbi',
  elephantyam: 'Suran/Jimikand', mushroom: 'Khumb', babycorn: 'Chota Bhutta',
  corn: 'Bhutta', garlic: 'Lahsun', shallot: 'Pearl Onion',
  broadbeans: 'Sem', clusterbeans: 'Guar Phali', frenchbeans: 'Farsi Phali',
  butterbeans: 'Sem Phali', corianderleaves: 'Dhaniya', curryleaves: 'Kadi Patta',
  fenugreekleaves: 'Methi', mustardleaves: 'Sarson', dillleaves: 'Suva Bhaji',
  amaranthleaves: 'Chaulai', colocasialeaves: 'Arbi Patta',
  sorrelleaves: 'Khatti Bhaji', amla: 'Amla', bananaflower: 'Kele ka Phool',
  plantain: 'Kachcha Kela', mangoraw: 'Kacchi Keri',
};

// ── Default weight map ────────────────────────────────────────────────────────
const WEIGHT_MAP = {
  corianderleaves: '100 gm', curryleaves: '50 gm', mintleaves: '100 gm',
  fenugreekleaves: '100 gm', mustardleaves: '250 gm', dillleaves: '100 gm',
  amaranthleaves: '250 gm', colocasialeaves: '100 gm', sorrelleaves: '100 gm',
  spinach: '250 gm', greenchili: '100 gm', ginger: '100 gm',
  garlic: '100 gm', oniongreen: '100 gm', babycorn: '200 gm',
  mushroom: '200 gm', corn: '2 pcs', drumsticks: '250 gm',
  ivygourd: '250 gm', bittergourd: '250 gm', ladiesfinger: '250 gm',
  broadbeans: '250 gm', clusterbeans: '250 gm', frenchbeans: '250 gm',
  butterbeans: '250 gm', shallot: '250 gm', amla: '250 gm',
  bananaflower: '500 gm', plantain: '500 gm', mangoraw: '250 gm',
  brinjalbig: '500 gm', lemon: '200 gm', beetroot: '250 gm',
  capsicum: '250 gm',
};
const DEFAULT_WEIGHT = '500 gm';

// ── Parse retail price range → low & high ─────────────────────────────────────
function parseRetail(str) {
  const parts = String(str || '').split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { low: parts[0], high: parts[1] };
  }
  return null;
}

// ── Build product object from API item ────────────────────────────────────────
function buildProduct(apiItem) {
  const { id: marketId, columnNameEng } = apiItem;
  const hindi = HINDI_MAP[marketId];
  const name  = hindi ? `${columnNameEng} (${hindi})` : columnNameEng;
  const range = parseRetail(apiItem.retailprice);
  const base  = range?.low  || Math.round(apiItem.price * 1.2);
  const high  = range?.high || Math.round(apiItem.price * 1.4);

  return {
    id:           `v-${marketId}`,
    marketId,
    name,
    category:     'vegetables',
    weight:       WEIGHT_MAP[marketId] || DEFAULT_WEIGHT,
    priceInstant: base,
    priceMorning: base,
    oldPrice:     high,
    emoji:        EMOJI_MAP[marketId] || '🥦',
    tag:          'Fresh',
    discount:     `${Math.round(((high - base) / high) * 100)}% OFF`,
    origin:       'Direct from Mandi',
    description:  'Fresh and best price in Bhiwani.',
    image:        `https://placehold.co/400x400/f5f5f5/aaa?text=${encodeURIComponent(columnNameEng)}`,
    inStock:      true,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Fetch API
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const url = `https://vegetablemarketprice.com/api/dataapi/market/bhiwani/daywisedata?date=${dateStr}`;

  console.log(`\n🌐 Fetching Bhiwani Mandi API for ${dateStr}...`);
  const res  = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer':    'https://vegetablemarketprice.com',
    }
  });
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const json = await res.json();
  const apiItems = json.data;
  console.log(`✅ API returned ${apiItems.length} vegetables`);

  // 2. Fetch Firebase
  const INVENTORY_DOC = doc(db, 'inventory', 'menu');
  const snap = await getDoc(INVENTORY_DOC);
  if (!snap.exists()) throw new Error('No inventory document in Firestore');
  const menuObj = snap.data().menu;
  const existingVegs = menuObj.vegetables || [];

  // 3. Build set of existing marketIds
  const existingMarketIds = new Set(existingVegs.map(p => p.marketId).filter(Boolean));
  console.log(`\n🥬 Currently in DB: ${existingVegs.length} vegetables (${existingMarketIds.size} with marketId)`);
  console.log('─'.repeat(55));

  // 4. Find missing
  const toAdd = [];
  for (const apiItem of apiItems) {
    if (existingMarketIds.has(apiItem.id)) {
      console.log(`  ✅ EXISTS  [${apiItem.id.padEnd(18)}] ${apiItem.columnNameEng}`);
    } else {
      const product = buildProduct(apiItem);
      toAdd.push(product);
      console.log(`  ➕ MISSING [${apiItem.id.padEnd(18)}] ${apiItem.columnNameEng} → will add as "${product.name}"`);
    }
  }

  console.log('─'.repeat(55));
  console.log(`\n  Already in DB: ${existingVegs.length}`);
  console.log(`  To add:        ${toAdd.length}`);

  if (toAdd.length === 0) {
    console.log('\n✅ All API vegetables already exist in Firebase. Nothing to do!\n');
    process.exit(0);
  }

  // 5. Merge and save
  const updatedMenu = {
    ...menuObj,
    vegetables: [...existingVegs, ...toAdd],
  };

  console.log('\n💾 Saving to Firestore...');
  await setDoc(INVENTORY_DOC, {
    menu: updatedMenu,
    updatedAt: serverTimestamp(),
  });

  console.log(`\n🎉 Done!`);
  console.log(`   ➕ Added:    ${toAdd.length} new vegetables`);
  console.log(`   ✅ Existing: ${existingVegs.length} untouched`);
  console.log(`\n   Added items:`);
  toAdd.forEach(p => console.log(`      • ${p.name}  (marketId: ${p.marketId})`));
  console.log('');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message || err);
  process.exit(1);
});

