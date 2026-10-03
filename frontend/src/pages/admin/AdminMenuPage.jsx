import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllProducts,
  saveInventory,
} from '../../features/products/productsSlice';
import { selectCategories } from '../../features/categories/categoriesSlice';
import {
  Plus, Pencil, Trash2, Save, X, Package, Tag, Layers,
  ToggleLeft, ToggleRight, ImageIcon, ChevronDown
} from 'lucide-react';

// ── Defined OUTSIDE the component so it doesn't remount on every render ────────
// (putting components inside another component's render body causes keyboard dismiss)
const inp = 'w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition';

const FormField = ({ label, children }) => (
  <div>
    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1 block">{label}</label>
    {children}
  </div>
);

const EMPTY_FORM = {
  id: '',
  name: '',
  weight: '',
  category: 'vegetables',
  priceInstant: '',
  priceMorning: '',
  oldPrice: '',
  image: '',
  emoji: '🥬',
  tag: '',
  discount: '',
  description: '',
  inStock: true,
};

export default function AdminMenuPage() {
  const dispatch   = useDispatch();
  const products   = useSelector(selectAllProducts);
  const CATEGORIES = useSelector(selectCategories);

  const [editingId, setEditingId]   = useState(null); // null = no edit, 'new' = adding
  const [form, setForm]             = useState(EMPTY_FORM);
  const [filterCat, setFilterCat]   = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const openNew = () => {
    setForm({ ...EMPTY_FORM, id: `p${Date.now()}` });
    setEditingId('new');
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditingId(p.id);
  };

  const closeForm = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const save = () => {
    if (!form.name || !form.priceInstant) return;
    let updated;
    if (editingId === 'new') {
      updated = [{ ...form }, ...products];
    } else {
      updated = products.map(p => p.id === editingId ? { ...form } : p);
    }
    dispatch(saveInventory(updated));
    closeForm();
  };

  const toggleStock = (id) => {
    const updated = products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p);
    dispatch(saveInventory(updated));
  };

  const deleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    dispatch(saveInventory(updated));
    setConfirmDelete(null);
  };

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat);


  return (
    <div className="pb-28 space-y-3">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-emerald-600" /> Menu Management
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{products.length} products</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus size={12} /> Add Product
        </button>
      </div>

      {/* ── Category filter ─────────────────────────────────────────────────── */}
      <div className="px-3 flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setFilterCat('all')}
          className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border transition ${filterCat === 'all' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
        >
          All ({products.length})
        </button>
        {CATEGORIES.map(c => {
          const cnt = products.filter(p => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border transition ${filterCat === c.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'}`}
            >
              {c.icon} {c.label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* ── Edit / Add Form ─────────────────────────────────────────────────── */}
      {editingId && (
        <div className="mx-3 bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">
              {editingId === 'new' ? '➕ New Product' : '✏️ Edit Product'}
            </span>
            <button onClick={closeForm} className="text-white/80 hover:text-white"><X size={15} /></button>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              <FormField label="Product Name *">
                <input className={inp} value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))} placeholder="e.g. Fresh Tomatoes" />
              </FormField>
            </div>

            <FormField label="Weight / Unit">
              <input className={inp} value={form.weight} onChange={e => setForm(f=>({...f, weight: e.target.value}))} placeholder="e.g. 500g" />
            </FormField>

            <FormField label="Category">
              <select className={inp} value={form.category} onChange={e => setForm(f=>({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </FormField>

            <FormField label="Instant Price (₹) *">
              <input className={inp} type="number" value={form.priceInstant} onChange={e => setForm(f=>({...f, priceInstant: Number(e.target.value)}))} placeholder="55" />
            </FormField>

            <FormField label="Morning Price (₹)">
              <input className={inp} type="number" value={form.priceMorning} onChange={e => setForm(f=>({...f, priceMorning: Number(e.target.value)}))} placeholder="45" />
            </FormField>

            <FormField label="Old/MRP Price (₹)">
              <input className={inp} type="number" value={form.oldPrice} onChange={e => setForm(f=>({...f, oldPrice: Number(e.target.value)}))} placeholder="70" />
            </FormField>

            <FormField label="Discount Label">
              <input className={inp} value={form.discount} onChange={e => setForm(f=>({...f, discount: e.target.value}))} placeholder="20% OFF" />
            </FormField>

            <FormField label="Emoji">
              <input className={inp} value={form.emoji} onChange={e => setForm(f=>({...f, emoji: e.target.value}))} placeholder="🥬" />
            </FormField>

            <FormField label="Tag">
              <input className={inp} value={form.tag} onChange={e => setForm(f=>({...f, tag: e.target.value}))} placeholder="Farm Fresh" />
            </FormField>

            <div className="col-span-2">
              <FormField label="Image URL">
                <input className={inp} value={form.image} onChange={e => setForm(f=>({...f, image: e.target.value}))} placeholder="https://..." />
              </FormField>
            </div>

            <div className="col-span-2">
              <FormField label="Description">
                <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))} placeholder="Short product description..." />
              </FormField>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">In Stock</span>
              <button onClick={() => setForm(f=>({...f, inStock: !f.inStock}))} className="transition">
                {form.inStock
                  ? <ToggleRight size={24} className="text-emerald-600" />
                  : <ToggleLeft  size={24} className="text-slate-300" />}
              </button>
              <span className={`text-[10px] font-bold ${form.inStock ? 'text-emerald-600' : 'text-slate-400'}`}>
                {form.inStock ? 'Available' : 'Out of Stock'}
              </span>
            </div>

            <div className="col-span-2 flex gap-2 pt-1">
              <button
                onClick={closeForm}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!form.name || !form.priceInstant}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95"
              >
                <Save size={12} /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Products List ───────────────────────────────────────────────────── */}
      <div className="px-3 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center space-y-2">
            <Package size={32} className="text-slate-300" />
            <p className="text-xs text-slate-400 font-semibold">No products in this category</p>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="flex items-center gap-2.5 p-2.5">
              {/* Image / emoji */}
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl border border-slate-100">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                  : p.emoji || '📦'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-[11px] font-extrabold text-slate-900 leading-tight truncate">{p.name}</h3>
                  <span className={`flex-shrink-0 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                    {p.inStock ? 'IN STOCK' : 'OUT'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {CATEGORIES.find(c=>c.id===p.category)?.icon} {p.category}
                  </span>
                  <span className="text-[9px] text-slate-400">⚖️ {p.weight}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-extrabold text-slate-900">₹{p.priceInstant} <span className="text-[9px] font-normal text-slate-400">instant</span></span>
                  {p.priceMorning && <span className="text-xs font-extrabold text-emerald-700">₹{p.priceMorning} <span className="text-[9px] font-normal text-slate-400">morning</span></span>}
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="border-t border-slate-100 flex divide-x divide-slate-100">
              <button
                onClick={() => toggleStock(p.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition"
              >
                {p.inStock ? <ToggleRight size={12} className="text-emerald-500" /> : <ToggleLeft size={12} />}
                {p.inStock ? 'Mark Out' : 'Mark In'}
              </button>
              <button
                onClick={() => openEdit(p)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(p.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-slate-900">Delete Product?</h3>
            <p className="text-xs text-slate-500">This will remove the product from your menu. This action cannot be undone.</p>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl">
                Cancel
              </button>
              <button onClick={() => deleteProduct(confirmDelete)} className="flex-1 bg-rose-600 text-white font-bold text-xs py-2.5 rounded-xl">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
