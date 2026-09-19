import React from 'react';
import { useSelector } from 'react-redux';
import { selectFilteredProducts } from '../../features/products/productsSlice';
import ProductCard from './ProductCard';
import { Grid } from 'lucide-react';

export default function ProductGrid() {
  const products = useSelector(selectFilteredProducts);

  return (
    <div className="space-y-2">
      {/* Header bar */}
      <div className="flex items-center justify-between px-0.5 pt-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">FRESH PRODUCE</h2>
          <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
            {products.length} items
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <span>Dense View</span>
          <Grid size={12} className="text-emerald-600" />
        </div>
      </div>

      {/* 2-Column High-Density Grid */}
      <div className="grid grid-cols-2 gap-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

