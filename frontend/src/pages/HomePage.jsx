import React from 'react';
import ProductGrid from '../components/home/ProductGrid';

export default function HomePage() {
  return (
    <div className="space-y-3 pb-28 p-3">
      {/* High-Density Product Grid */}
      <ProductGrid />
    </div>
  );
}
