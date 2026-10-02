import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectActiveCategory,
  setActiveCategory,
  selectAvailableCategories,
} from '../../features/products/productsSlice';

// Category display config — maps Firestore category key → label + emoji
const CATEGORY_META = {
  all:        { label: '🔥 All Produce'     },
  vegetables: { label: '🥬 Vegetables'      },
  fruits:     { label: '🍎 Fresh Fruits'    },
  exotic:     { label: '🥑 Organic & Exotic' },
  combos:     { label: '📦 Value Combos'    },
  seasonal:   { label: '🌱 Seasonal'        },
  sprouts:    { label: '🌿 Sprouts & Herbs' },
};

export default function CategoryBar() {
  const dispatch    = useDispatch();
  const activeCat   = useSelector(selectActiveCategory);
  const availCats   = useSelector(selectAvailableCategories); // from live Firestore data

  // Build the tab list: always "all" first, then whatever categories exist in Firestore
  const tabs = [
    { id: 'all', label: '🔥 All Produce' },
    ...availCats.map(cat => ({
      id:    cat,
      label: CATEGORY_META[cat]?.label || `🛒 ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
    })),
  ];

  return (
    <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[11px] bg-white border-t border-slate-100">
      {tabs.map((cat) => {
        const isActive = activeCat === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => dispatch(setActiveCategory(cat.id))}
            className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
