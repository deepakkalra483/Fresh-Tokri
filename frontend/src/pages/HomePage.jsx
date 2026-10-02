import React from 'react';
import CategoryBar from '../components/home/CategoryBar';
import ProductGrid from '../components/home/ProductGrid';

export default function HomePage() {
  return (
    <div className="space-y-3 pb-28 p-3">
      {/* Category Filter Bar with Breathing Room */}
      {/* <CategoryBar /> */}

      {/* High-Density Product Grid */}
      <ProductGrid />
    </div>
  );
}
