import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectIsAddModalOpen, 
  selectEditingProduct, 
  createProductThunk, 
  updateProductThunk, 
  closeModal 
} from '../../features/adminProducts/adminProductsSlice';
import { X, Save, Plus, Package } from 'lucide-react';

export default function AddEditProductModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsAddModalOpen);
  const editingProduct = useSelector(selectEditingProduct);

  const [formData, setFormData] = useState({
    name: '',
    weight: '1 kg',
    category: 'vegetables',
    priceInstant: 40,
    priceMorning: 32,
    oldPrice: 50,
    image: '',
    tag: 'Farm Fresh',
    discount: '20% OFF',
    description: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData({
        name: '',
        weight: '1 kg',
        category: 'vegetables',
        priceInstant: 40,
        priceMorning: 32,
        oldPrice: 50,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
        tag: 'Farm Fresh',
        discount: '20% OFF',
        description: 'Fresh organic produce sourced directly from local partner farms.',
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      dispatch(updateProductThunk(formData));
    } else {
      dispatch(createProductThunk(formData));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl max-h-[90%] overflow-y-auto space-y-3 p-4 shadow-2xl max-w-md mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              <Package size={14} />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              {editingProduct ? 'Edit Produce Item' : 'Add New Produce Item'}
            </h3>
          </div>
          <button 
            onClick={() => dispatch(closeModal())}
            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          <div>
            <label className="font-bold text-slate-700 block mb-1">Produce Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Fresh Organic Tomatoes"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-100 text-xs text-slate-900 font-semibold p-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-100 text-xs text-slate-900 font-semibold p-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none"
              >
                <option value="vegetables">🥬 Vegetables</option>
                <option value="fruits">🍎 Fresh Fruits</option>
                <option value="exotic">🥑 Organic & Exotic</option>
                <option value="combos">📦 Combos</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Weight Unit</label>
              <input 
                type="text" 
                required
                placeholder="e.g. 500 g or 1 kg"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full bg-slate-100 text-xs text-slate-900 font-semibold p-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Dual Pricing */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div>
              <label className="font-bold text-rose-700 block mb-1">⚡ Instant Price (₹)</label>
              <input 
                type="number" 
                required
                value={formData.priceInstant}
                onChange={(e) => setFormData({ ...formData, priceInstant: Number(e.target.value) })}
                className="w-full bg-white text-xs text-slate-900 font-extrabold p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-emerald-700 block mb-1">🌅 Morning Price (20% Off)</label>
              <input 
                type="number" 
                required
                value={formData.priceMorning}
                onChange={(e) => setFormData({ ...formData, priceMorning: Number(e.target.value) })}
                className="w-full bg-white text-xs text-slate-900 font-extrabold p-2 rounded-lg border border-slate-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Image URL</label>
            <input 
              type="url" 
              required
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-slate-100 text-xs text-slate-900 font-medium p-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-100 text-xs text-slate-900 font-medium p-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Save size={15} />
            <span>{editingProduct ? 'Save Product Changes' : 'Add Product to Store'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}

