import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCategories,
  selectCategoriesStatus,
  saveCategories,
} from '../../features/categories/categoriesSlice';
import {
  Plus, Pencil, Trash2, Save, X, Layers,
  GripVertical, ChevronUp, ChevronDown, Tag,
} from 'lucide-react';

const EMPTY_FORM = { id: '', label: '', icon: '📦' };

// Slugify a label into a safe Firestore key
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export default function AdminCategoriesPage() {
  const dispatch    = useDispatch();
  const categories  = useSelector(selectCategories);
  const status      = useSelector(selectCategoriesStatus);

  const [editingId, setEditingId]         = useState(null); // null | 'new' | category.id
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]                 = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // ── Open forms ─────────────────────────────────────────────────────────────
  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId('new');
  };

  const openEdit = (cat) => {
    setForm({ id: cat.id, label: cat.label, icon: cat.icon });
    setEditingId(cat.id);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const save = () => {
    if (!form.label.trim()) return;

    let updated;
    if (editingId === 'new') {
      const newId = slugify(form.label);
      if (categories.some(c => c.id === newId)) {
        showToast('⚠️ A category with this name already exists');
        return;
      }
      updated = [...categories, { id: newId, label: form.label.trim(), icon: form.icon || '📦' }];
    } else {
      updated = categories.map(c =>
        c.id === editingId
          ? { ...c, label: form.label.trim(), icon: form.icon || '📦' }
          : c
      );
    }
    dispatch(saveCategories(updated));
    showToast('✅ Category saved!');
    closeForm();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteCategory = (id) => {
    const updated = categories.filter(c => c.id !== id);
    dispatch(saveCategories(updated));
    setConfirmDelete(null);
    showToast('🗑️ Category deleted');
  };

  // ── Reorder ────────────────────────────────────────────────────────────────
  const moveUp = (idx) => {
    if (idx === 0) return;
    const arr = [...categories];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    dispatch(saveCategories(arr));
  };

  const moveDown = (idx) => {
    if (idx === categories.length - 1) return;
    const arr = [...categories];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    dispatch(saveCategories(arr));
  };

  const inp = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition';

  return (
    <div className="pb-28 space-y-3">

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-3 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={13} className="text-emerald-600" /> Categories
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5">{categories.length} categories · drag to reorder</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
        >
          <Plus size={12} /> Add Category
        </button>
      </div>

      {/* ── Add / Edit Form ───────────────────────────────────────────────────── */}
      {editingId && (
        <div className="mx-3 bg-white rounded-2xl border border-emerald-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white">
              {editingId === 'new' ? '➕ New Category' : '✏️ Edit Category'}
            </span>
            <button onClick={closeForm} className="text-white/80 hover:text-white">
              <X size={15} />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1 block">
                Emoji Icon
              </label>
              <input
                className={`${inp} text-xl text-center`}
                value={form.icon}
                maxLength={4}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="📦"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mb-1 block">
                Category Name *
              </label>
              <input
                className={inp}
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Dairy Products"
              />
              {editingId === 'new' && form.label && (
                <p className="text-[9px] text-slate-400 mt-1">
                  ID will be: <code className="bg-slate-100 px-1 rounded">{slugify(form.label)}</code>
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeForm}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!form.label.trim() || status === 'saving'}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition active:scale-95"
              >
                <Save size={12} />
                {status === 'saving' ? 'Saving…' : 'Save Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Info card ────────────────────────────────────────────────────────── */}
      <div className="mx-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2.5 flex items-start gap-2">
        <Tag size={13} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-emerald-700 leading-relaxed">
          Categories appear on the <strong>Home</strong>, <strong>Shop</strong>, and <strong>Menu</strong> pages. 
          Use ↑↓ arrows to reorder them. Category IDs cannot be changed after creation.
        </p>
      </div>

      {/* ── Categories List ───────────────────────────────────────────────────── */}
      <div className="px-3 space-y-2">
        {categories.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center space-y-2">
            <Layers size={32} className="text-slate-300" />
            <p className="text-xs text-slate-400 font-semibold">No categories yet</p>
          </div>
        )}

        {categories.map((cat, idx) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              {/* Emoji */}
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                {cat.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-extrabold text-slate-900">{cat.label}</p>
                <p className="text-[9px] text-slate-400 font-mono">id: {cat.id}</p>
              </div>

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === categories.length - 1}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 transition"
                >
                  <ChevronDown size={12} />
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="border-t border-slate-100 flex divide-x divide-slate-100">
              <button
                onClick={() => openEdit(cat)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition"
              >
                <Pencil size={11} /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(cat.id)}
                className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 transition"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-slate-900">Delete Category?</h3>
            <p className="text-xs text-slate-500">
              Products in this category will <strong>not</strong> be deleted — they will just become uncategorized. 
              This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-bold text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(confirmDelete)}
                className="flex-1 bg-rose-600 text-white font-bold text-xs py-2.5 rounded-xl"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
