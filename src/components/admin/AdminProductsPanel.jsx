import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  Power,
  X,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  normaliseProduct,
} from '../../api/productService';

/** Categories offered in the product form. */
const CATEGORIES = [
  'Chargers & Cables',
  'Audio & Sound',
  'Smartphones',
  'Home Appliances',
  'Accessories',
  'Networking Maintenance',
  'Office Furniture',
  'TeKeL Branding & Print',
  'Power Banks',
];

const LANGS = [
  { key: 'en', label: 'EN' },
  { key: 'sw', label: 'SW' },
  { key: 'zh', label: 'ZH' },
  { key: 'fr', label: 'FR' },
];

const EMPTY_FORM = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  originalPrice: '',
  stock: '',
  rating: '4.8',
  image: '',
  description: { en: '', sw: '', zh: '', fr: '' },
};

function stockStatus(stock) {
  if (stock <= 0) return { label: 'Out of Stock', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
  if (stock <= 10) return { label: 'Low Stock', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: 'In Stock', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
}

export default function AdminProductsPanel({ onToast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // `includeUnavailable` keeps hidden products visible to the admin.
      const { products } = await getProducts({ includeUnavailable: true, limit: 200 });
      setRows(products);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setRows([]);
      setLoadError('Could not reach the inventory service. Changes cannot be saved right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Category pills follow whatever is actually stored in the database. */
  const categoryOptions = useMemo(() => {
    const fromDb = rows.map((row) => row.category).filter(Boolean);
    const unique = Array.from(new Set([...fromDb, ...CATEGORIES]));
    return ['All Categories', ...unique];
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesCategory =
        categoryFilter === 'All Categories' || row.category === categoryFilter;
      const matchesSearch =
        !term ||
        row.name.toLowerCase().includes(term) ||
        String(row.category).toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [rows, search, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      category: row.category,
      price: String(row.price ?? ''),
      originalPrice: row.originalPrice ? String(row.originalPrice) : '',
      stock: String(row.stock ?? ''),
      rating: String(row.rating ?? ''),
      image: row.image || '',
      description: {
        en: row.descriptions?.en || row.description || '',
        sw: row.descriptions?.sw || '',
        zh: row.descriptions?.zh || '',
        fr: row.descriptions?.fr || '',
      },
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Product name is required.';
    if (!form.category) next.category = 'Category is required.';
    if (!String(form.price).trim()) next.price = 'Price is required.';
    else if (Number(form.price) <= 0) next.price = 'Price must be greater than zero.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock || 0),
      rating: Number(form.rating || 0),
      image: form.image.trim(),
      description: form.description,
    };

    try {
      if (editingId) {
        // The server response is the source of truth for the updated row.
        const saved = await updateProduct(editingId, payload);
        setRows((current) =>
          current.map((row) => (row.id === editingId ? { ...row, ...normaliseProduct(saved) } : row))
        );
        onToast?.('Product Updated Successfully!');
      } else {
        const created = await createProduct(payload);
        setRows((current) => [normaliseProduct(created), ...current]);
        onToast?.('Product Added Successfully!');
      }
      setFormOpen(false);
    } catch (err) {
      console.error('Product save failed:', err);
      onToast?.(
        err?.response?.data?.message || 'Could not save the product. Please try again.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete "${row.name}" from the catalog?`)) return;
    setBusyId(row.id);
    try {
      await deleteProduct(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      onToast?.('Product Deleted Successfully!');
    } catch (err) {
      console.error('Delete failed:', err);
      onToast?.(
        err?.response?.data?.message || 'Could not delete the product. Please try again.',
        'error'
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (row) => {
    setBusyId(row.id);
    const nextAvailable = !row.isAvailable;
    try {
      await toggleProductAvailability(row.id, nextAvailable);
      setRows((current) =>
        current.map((item) =>
          item.id === row.id ? { ...item, isAvailable: nextAvailable } : item
        )
      );
      onToast?.(`${row.name} marked ${nextAvailable ? 'Available' : 'Unavailable'}.`);
    } catch (err) {
      console.error('Availability toggle failed:', err);
      onToast?.(
        err?.response?.data?.message || 'Could not update availability. Please try again.',
        'error'
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
        >
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-md shadow-orange-500/20"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </button>
      </div>

      {loadError ? (
        <p className="flex items-center gap-2 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} />
          {loadError}
        </p>
      ) : null}

      {/* Inventory table */}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 size={22} className="animate-spin text-orange-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading inventory...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-800/80">
              <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Price</th>
                <th className="px-4 py-3 font-bold">Stock</th>
                <th className="px-4 py-3 font-bold">Rating</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const status = stockStatus(row.stock);
                return (
                  <tr key={row.id} className="border-t border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                          {row.image ? (
                            <img src={row.image} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Package size={16} className="text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white line-clamp-1 max-w-[220px]">
                            {row.name}
                          </p>
                          {!row.isAvailable ? (
                            <span className="text-[10px] font-bold text-red-400 uppercase">Hidden</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.category}</td>
                    <td className="px-4 py-3 text-xs font-bold text-white">
                      TSh {Number(row.price || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded border ${status.className}`}>
                        {status.label}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">{row.stock} units</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-400">★ {row.rating}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`Edit ${row.name}`}
                          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(row)}
                          disabled={busyId === row.id}
                          aria-label={`Toggle availability for ${row.name}`}
                          className={`h-8 w-8 rounded-lg bg-slate-800 border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${
                            row.isAvailable
                              ? 'border-slate-700 text-emerald-400 hover:border-emerald-500'
                              : 'border-slate-700 text-slate-500 hover:border-slate-500'
                          }`}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={busyId === row.id}
                          aria-label={`Delete ${row.name}`}
                          className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-red-400 hover:border-red-500 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length ? (
            <p className="text-center text-xs font-bold text-slate-400 py-10">
              No products match your search.
            </p>
          ) : null}
        </div>
      )}

      {/* Add / Edit modal */}
      {formOpen ? (
        <div className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setFormOpen(false)} aria-hidden="true" />

          <form
            onSubmit={handleSubmit}
            className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h3 className="text-sm font-extrabold text-white">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Product Name" required error={errors.name} className="sm:col-span-2">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="admin-input"
                    placeholder="Hualink 65W Fast Charger Adapter"
                  />
                </Field>

                <Field label="Category" required error={errors.category}>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="admin-input cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Price (TSh)" required error={errors.price}>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="admin-input"
                    placeholder="25000"
                  />
                </Field>

                <Field label="Original Price (TSh)">
                  <input
                    type="number"
                    min="0"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    className="admin-input"
                    placeholder="35000"
                  />
                </Field>

                <Field label="Stock Quantity">
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="admin-input"
                    placeholder="120"
                  />
                </Field>

                <Field label="Rating (0-5)">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="admin-input"
                  />
                </Field>

                <Field label="Image URL" className="sm:col-span-2">
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="admin-input"
                    placeholder="https://..."
                  />
                  {form.image ? (
                    <div className="mt-2 h-24 w-24 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                      <img src={form.image} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                  ) : null}
                </Field>
              </div>

              {/* Multi-language description */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Multi-language Description
                </p>
                <div className="space-y-3">
                  {LANGS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mb-1">
                        <span className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">{label}</span>
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={form.description[key]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: { ...form.description, [key]: e.target.value },
                          })
                        }
                        className="admin-input resize-none"
                        placeholder={`Description in ${label}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-5 py-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>{editingId ? 'Save Changes' : 'Add Product'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, required, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
        {label}
        {required ? <span className="text-orange-500"> *</span> : null}
      </label>
      {children}
      {error ? <p className="text-[10px] font-bold text-red-400 mt-1">{error}</p> : null}
    </div>
  );
}
