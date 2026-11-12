import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllProducts,
  saveInventory,
} from '../../features/products/productsSlice';
import { selectCategories } from '../../features/categories/categoriesSlice';
import { syncPricesFromMandi } from '../../firebase/priceSyncService';
import {
  Plus, Pencil, Trash2, Save, X, Package, Layers,
  ToggleLeft, ToggleRight, RefreshCw, CheckCircle2, AlertCircle,
  Share2, Copy, MessageCircle, ChevronDown, CheckSquare, Square,
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
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const CATEGORIES = useSelector(selectCategories);

  const [editingId, setEditingId] = useState(null); // null = no edit, 'new' = adding
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCat, setFilterCat] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Price Sync state ──────────────────────────────────────────────────────────
  const [syncOpen, setSyncOpen] = useState(false);
  const [instantMargin, setInstantMargin] = useState('');
  const [morningMargin, setMorningMargin] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null); // null | { updated, skipped, errors }

  // ── Share Price List state ────────────────────────────────────────────────────
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCat, setShareCat] = useState('vegetables');
  const [copied, setCopied] = useState(false);
  // Set of product IDs selected for WhatsApp broadcast
  const [selectedShareIds, setSelectedShareIds] = useState(null);

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

  // ── Share Price List ──────────────────────────────────────────────────────────
  // Returns currently available in-stock products in the selected category
  const getCatInStockProducts = (categoryId) => {
    return products
      .filter(p => p.category === categoryId && p.inStock !== false)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Helper to check if an item is selected (defaults to true if selectedShareIds is null)
  const isItemSelected = (id) => {
    if (selectedShareIds === null) return true;
    return selectedShareIds.has(id);
  };

  const toggleSelectItem = (id) => {
    const inStock = getCatInStockProducts(shareCat);
    const current = selectedShareIds !== null
      ? new Set(selectedShareIds)
      : new Set(inStock.map(p => p.id));

    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    setSelectedShareIds(current);
  };

  const selectAllCategoryItems = () => {
    const inStock = getCatInStockProducts(shareCat);
    setSelectedShareIds(new Set(inStock.map(p => p.id)));
  };

  const deselectAllCategoryItems = () => {
    setSelectedShareIds(new Set());
  };

  const buildShareText = (categoryId) => {
    const today = new Date();
    const dateLabel = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const catInfo = CATEGORIES.find(c => c.id === categoryId);
    const allInStock = getCatInStockProducts(categoryId);
    const list = allInStock.filter(p => isItemSelected(p.id));

    if (list.length === 0) return '';

    const header =
      `*Fresh Tokri — Aaj ki Bhav List*\n` +
      `📅 ${dateLabel}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `*${(catInfo?.label || categoryId).toUpperCase()}*\n`;

    // Clean single-line format without emojis, e.g. "Lady finger (Bhindi) - ₹30/250 gm"
    const rows = list.map(p => {
      const cleanWeight = p.weight ? `/${p.weight}` : '';
      return `${p.name} - ₹${p.priceInstant}${cleanWeight}`;
    }).join('\n');

    const footer =
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Order karo Fresh Tokri par!*\n` +
      `📱 freshtokri.in\n` +
      `Same-day & morning delivery available`;

    return header + rows + footer;
  };

  const handleCopy = (categoryId) => {
    const text = buildShareText(categoryId);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsApp = (categoryId) => {
    const text = buildShareText(categoryId);
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // ── Sync handler ─────────────────────────────────────────────────────────────
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncPricesFromMandi(instantMargin, morningMargin);
      setSyncResult({ success: true, ...result });
    } catch (err) {
      setSyncResult({ success: false, message: err.message });
    } finally {
      setSyncing(false);
    }
  };


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

      {/* ── 🔄 Daily Price Sync Panel ───────────────────────────────────────── */}
      <div className="mx-3">
        {/* Collapsed header — always visible */}
        <button
          onClick={() => { setSyncOpen(o => !o); setSyncResult(null); }}
          className="w-full flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-2xl shadow-sm active:scale-95 transition"
        >
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span className="text-xs font-extrabold">Sync Today's Mandi Prices</span>
          </div>
          <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-bold">
            {syncOpen ? 'Close ▲' : 'Open ▼'}
          </span>
        </button>

        {/* Expanded panel */}
        {syncOpen && (
          <div className="bg-white border border-blue-100 rounded-b-2xl shadow-sm px-4 pt-3 pb-4 space-y-3 -mt-1">

            {/* Info note */}
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Fetches today's retail prices from <span className="font-bold text-blue-600">Bhiwani Mandi</span> and updates all
              vegetables that have a <code className="bg-slate-100 px-1 rounded">marketId</code>.
              Add a margin % to increase price above retail. Leave blank for retail price only.
            </p>

            {/* Margin inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1 block">
                  ⚡ Instant Margin %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={instantMargin}
                    onChange={e => setInstantMargin(e.target.value)}
                    placeholder="0  (no markup)"
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1 block">
                  🌅 Morning Margin %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={morningMargin}
                    onChange={e => setMorningMargin(e.target.value)}
                    placeholder="0  (no markup)"
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Price preview */}
            <div className="bg-slate-50 rounded-xl px-3 py-2 text-[10px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-600 mb-1">📐 How prices will be calculated:</p>
              <p>• <span className="font-semibold">Mandi API:</span> Uses <span className="font-bold text-slate-800">Maximum Retail Price</span> for 1 kg (e.g. if 23 - 29, takes ₹29/kg).</p>
              <p>• <span className="font-semibold">Round Off (Up to 500g):</span> All items up to 500g (50g, 100g, 250g, 500g) are rounded UP to the next multiple of 10 (e.g. ₹7 → ₹10, ₹14 → ₹20, ₹24 → ₹30).</p>
              <p>• <span className="font-semibold">Instant Price:</span> Converted base + {instantMargin || 0}% margin</p>
              <p>• <span className="font-semibold">Morning Price:</span> Converted base + {morningMargin || 0}% margin</p>
            </div>

            {/* Result banner */}
            {syncResult && (
              <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-[10px] font-semibold ${syncResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}>
                {syncResult.success
                  ? <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />
                  : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />}
                <div>
                  {syncResult.success ? (
                    <>
                      <p>✅ <span className="font-extrabold">{syncResult.updated}</span> products updated</p>
                      <p>⏭️ {syncResult.skipped} skipped (no marketId or not in API)</p>
                      {syncResult.errors?.length > 0 && (
                        <p className="text-rose-500 mt-1">⚠️ {syncResult.errors.length} warning(s): {syncResult.errors[0]}</p>
                      )}
                    </>
                  ) : (
                    <p>❌ Failed: {syncResult.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold text-xs py-3 rounded-xl transition active:scale-95"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing prices…' : '🔄 Sync Now'}
            </button>
          </div>
        )}
      </div>

      {/* ── 📤 Share Price List Panel ────────────────────────────────────────── */}
      <div className="mx-3">
        {/* Toggle button */}
        <button
          onClick={() => { setShareOpen(o => !o); setCopied(false); }}
          className="w-full flex items-center justify-between bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-3 rounded-2xl shadow-sm active:scale-95 transition"
        >
          <div className="flex items-center gap-2">
            <Share2 size={14} />
            <span className="text-xs font-extrabold">Share Price List on WhatsApp</span>
          </div>
          <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-bold">
            {shareOpen ? 'Close ▲' : 'Open ▼'}
          </span>
        </button>

        {shareOpen && (
          <div className="bg-white border border-emerald-100 rounded-b-2xl shadow-sm px-4 pt-3 pb-4 space-y-3 -mt-1">

            {/* Category selector */}
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1.5 block">
                Select Category to Share
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => {
                  const cnt = products.filter(p => p.category === c.id && p.inStock !== false).length;
                  if (cnt === 0) return null;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setShareCat(c.id);
                        setCopied(false);
                        setSelectedShareIds(null); // resets to select all for new category
                      }}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full border transition ${shareCat === c.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-500 border-slate-200'
                        }`}
                    >
                      {c.icon} {c.label} ({cnt})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checklist of Items to Include/Exclude */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[10px] font-extrabold text-slate-700">
                  Select Items to Broadcast ({getCatInStockProducts(shareCat).filter(p => isItemSelected(p.id)).length}/{getCatInStockProducts(shareCat).length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllCategoryItems}
                    className="text-[9px] font-bold text-emerald-700 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={deselectAllCategoryItems}
                    className="text-[9px] font-bold text-rose-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items scroll list */}
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {getCatInStockProducts(shareCat).map(p => {
                  const checked = isItemSelected(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleSelectItem(p.id)}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs cursor-pointer select-none border transition ${
                        checked
                          ? 'bg-emerald-50/80 border-emerald-200 text-slate-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {checked ? (
                          <CheckSquare size={13} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Square size={13} className="text-slate-400 flex-shrink-0" />
                        )}
                        <span className="truncate text-[11px]">{p.name}</span>
                      </div>
                      <span className="text-[10px] font-bold ml-2 flex-shrink-0">
                        ₹{p.priceInstant}{p.weight ? `/${p.weight}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview box */}
            <div className="bg-[#f0fdf4] rounded-xl p-3 border border-emerald-200">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-1.5 tracking-wide">📋 Preview (Clean Single-Line Format)</p>
              <pre className="text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-5 max-h-48 overflow-y-auto font-medium">
                {buildShareText(shareCat) || 'No items selected.'}
              </pre>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              {/* Copy */}
              <button
                onClick={() => handleCopy(shareCat)}
                className={`flex items-center justify-center gap-1.5 font-extrabold text-xs py-3 rounded-xl border transition active:scale-95 ${copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
              >
                <Copy size={13} />
                {copied ? '✅ Copied!' : 'Copy Text'}
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleWhatsApp(shareCat)}
                className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold text-xs py-3 rounded-xl transition active:scale-95 shadow-sm"
              >
                <MessageCircle size={13} />
                Share on WhatsApp
              </button>
            </div>

            <p className="text-[9px] text-slate-400 text-center">
              Only <span className="font-bold">In Stock</span> items are included · Sorted A–Z
            </p>
          </div>
        )}
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
                <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fresh Tomatoes" />
              </FormField>
            </div>

            <FormField label="Weight / Unit">
              <input className={inp} value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 500g" />
            </FormField>

            <FormField label="Category">
              <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </FormField>

            <FormField label="Instant Price (₹) *">
              <input className={inp} type="number" value={form.priceInstant} onChange={e => setForm(f => ({ ...f, priceInstant: Number(e.target.value) }))} placeholder="55" />
            </FormField>

            <FormField label="Morning Price (₹)">
              <input className={inp} type="number" value={form.priceMorning} onChange={e => setForm(f => ({ ...f, priceMorning: Number(e.target.value) }))} placeholder="45" />
            </FormField>

            <FormField label="Old/MRP Price (₹)">
              <input className={inp} type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: Number(e.target.value) }))} placeholder="70" />
            </FormField>

            <FormField label="Discount Label">
              <input className={inp} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="20% OFF" />
            </FormField>

            <FormField label="Emoji">
              <input className={inp} value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🥬" />
            </FormField>

            <FormField label="Tag">
              <input className={inp} value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Farm Fresh" />
            </FormField>

            <div className="col-span-2">
              <FormField label="Image URL">
                <input className={inp} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
              </FormField>
            </div>

            <div className="col-span-2">
              <FormField label="Description">
                <textarea className={`${inp} resize-none`} rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short product description..." />
              </FormField>
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">In Stock</span>
              <button onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))} className="transition">
                {form.inStock
                  ? <ToggleRight size={24} className="text-emerald-600" />
                  : <ToggleLeft size={24} className="text-slate-300" />}
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
                  ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
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
                    {CATEGORIES.find(c => c.id === p.category)?.icon} {p.category}
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
