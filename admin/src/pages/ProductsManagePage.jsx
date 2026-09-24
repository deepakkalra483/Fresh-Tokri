import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAdminProducts, 
  fetchAdminProducts,
  openAddModal, 
  openEditModal, 
  deleteProductThunk, 
  toggleStock 
} from '../features/adminProducts/adminProductsSlice';
import AddEditProductModal from '../components/products/AddEditProductModal';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function ProductsManagePage() {
  const dispatch = useDispatch();
  const products = useSelector(selectAdminProducts);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">Produce Catalog CRUD</h2>
          <p className="text-[11px] text-slate-500 font-medium">Add new vegetables & fruits, update prices, or toggle stock</p>
        </div>

        <button
          onClick={() => dispatch(openAddModal())}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Add New Produce</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((product) => (
          <div 
            key={product.id || product.productId}
            className="bg-white rounded-2xl p-3 shadow-2xs border border-slate-200/80 flex gap-3 relative hover:border-slate-300 transition"
          >
            {/* Image Thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 leading-tight">{product.name}</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">{product.weight} • {product.category}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => dispatch(openEditModal(product))}
                    className="p-1 text-slate-400 hover:text-emerald-600"
                    title="Edit Product"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => dispatch(deleteProductThunk(product.id || product.productId))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Dual Prices */}
              <div className="flex items-center gap-3 text-xs pt-1">
                <div>
                  <span className="text-[9px] text-rose-600 font-bold block">⚡ Instant</span>
                  <span className="font-extrabold text-slate-900">₹{product.priceInstant}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-600 font-bold block">🌅 Morning</span>
                  <span className="font-extrabold text-slate-900">₹{product.priceMorning}</span>
                </div>
              </div>

              {/* Stock Toggle */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => dispatch(toggleStock(product.id))}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                    product.inStock 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {product.inStock ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <AddEditProductModal />

    </div>
  );
}

