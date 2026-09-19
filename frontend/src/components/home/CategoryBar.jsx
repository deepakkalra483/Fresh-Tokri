import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveCategory, setActiveCategory } from '../../features/products/productsSlice';

const categories = [
  { id: 'all', label: '🔥 All Produce' },
  { id: 'vegetables', label: '🥬 Vegetables' },
  { id: 'fruits', label: '🍎 Fresh Fruits' },
  { id: 'exotic', label: '🥑 Organic & Exotic' },
  { id: 'combos', label: '📦 Value Combos' },
];

export default function CategoryBar() {
  const dispatch = useDispatch();
  const activeCat = useSelector(selectActiveCategory);

  return (
    <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[11px] bg-white border-t border-slate-100">
      {categories.map((cat) => {
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
