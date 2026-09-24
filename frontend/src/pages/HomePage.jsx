import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectActiveCategory, selectSearchQuery } from '../features/products/productsSlice';
import ProductGrid from '../components/home/ProductGrid';

export default function HomePage() {
  const dispatch = useDispatch();
  const activeCategory = useSelector(selectActiveCategory);
  const searchQuery = useSelector(selectSearchQuery);

  useEffect(() => {
    dispatch(fetchProducts({ category: activeCategory, search: searchQuery }));
  }, [dispatch, activeCategory, searchQuery]);

  return (
    <div className="space-y-3 pb-28 p-3">
      {/* High-Density Product Grid */}
      <ProductGrid />
    </div>
  );
}
