/**
 * cleanup-vegs.mjs
 * ─────────────────────────────────────────────────────────────
 * Removes vegetables from Firestore that have NO `marketId`.
 * These are old products added before the mandi price-sync system.
 *
 * ✅ Keeps  → vegetables WITH a marketId (linked to Bhiwani mandi API)
 * ❌ Removes → vegetables WITHOUT a marketId
 * 🔒 Untouched → fruits, exotic, combos, seasonal, sprouts
 *
 * Run from project root:
 *   node scripts/cleanup-vegs.mjs
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

async function main() {
  const INVENTORY_DOC = doc(db, 'inventory', 'menu');

  console.log('\n📥 Fetching inventory from Firestore...');
  const snap = await getDoc(INVENTORY_DOC);
  if (!snap.exists()) {
    console.log('❌ No inventory document found.');
    process.exit(1);
  }

  const menuObj = snap.data().menu;
  const vegs = menuObj.vegetables || [];

  console.log(`\n🥬 Total vegetables in DB: ${vegs.length}`);
  console.log('─'.repeat(50));

  const keep   = [];
  const remove = [];

  for (const p of vegs) {
    if (p.marketId) {
      keep.push(p);
      console.log(`  ✅ KEEP   [${p.marketId.padEnd(18)}] ${p.name}`);
    } else {
      remove.push(p);
      console.log(`  ❌ REMOVE [no marketId       ] ${p.name} (id: ${p.id})`);
    }
  }

  console.log('─'.repeat(50));
  console.log(`\n  Will keep:   ${keep.length} vegetables`);
  console.log(`  Will remove: ${remove.length} vegetables`);
  console.log(`  Other categories (fruits, etc.) → untouched 🔒`);

  if (remove.length === 0) {
    console.log('\n✅ Nothing to remove. All vegetables already have a marketId.\n');
    process.exit(0);
  }

  // Save updated menu
  const updatedMenu = {
    ...menuObj,
    vegetables: keep,
  };

  console.log('\n💾 Saving cleaned inventory to Firestore...');
  await setDoc(INVENTORY_DOC, {
    menu: updatedMenu,
    updatedAt: serverTimestamp(),
  });

  console.log('\n🎉 Done!');
  console.log(`   ✅ Kept:    ${keep.length} vegetables (all have marketId)`);
  console.log(`   🗑️  Removed: ${remove.length} vegetables (had no marketId)`);
  console.log(`   📋 Removed items:`);
  remove.forEach(p => console.log(`      • ${p.name} (id: ${p.id})`));
  console.log('');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message || err);
  process.exit(1);
});

