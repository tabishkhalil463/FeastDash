import { useState, useEffect } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiX,
} from 'react-icons/fi';
import API, { mediaUrl } from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { formatPrice } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function MenuManagementPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'category'|'item', data }

  // Category modal
  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', sort_order: 0 });
  const [editingCat, setEditingCat] = useState(null);
  const [catSaving, setCatSaving] = useState(false);

  // Item modal
  const [itemModal, setItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', discounted_price: '', category: '',
    preparation_time: '15', is_available: true, is_vegetarian: false, is_spicy: false,
  });
  const [itemImage, setItemImage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data: rest } = await API.get('restaurants/my-restaurant/');
      setRestaurant(rest);
      const { data: cats } = await API.get(`restaurants/${rest.slug}/categories/`);
      setCategories(cats);
      // Expand all by default
      const exp = {};
      cats.forEach((c) => { exp[c.id] = true; });
      setExpanded(exp);
    } catch {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  // ---- Category CRUD ----
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', description: '', sort_order: 0 });
    }
    setCatModal(true);
  };

  const saveCat = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) { toast.error('Category name is required'); return; }
    setCatSaving(true);
    try {
      if (editingCat) {
        await API.put(`restaurants/${restaurant.slug}/categories/${editingCat.id}/`, catForm);
        toast.success('Category updated');
      } else {
        await API.post(`restaurants/${restaurant.slug}/categories/`, catForm);
        toast.success('Category created');
      }
      setCatModal(false);
      fetchData();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setCatSaving(false);
    }
  };

  const deleteCat = async (cat) => {
    try {
      await API.delete(`restaurants/${restaurant.slug}/categories/${cat.id}/`);
      toast.success('Category deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // ---- Item CRUD ----
  const openItemModal = (categoryId, item = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name, description: item.description || '', price: item.price,
        discounted_price: item.discounted_price || '', category: item.category,
        preparation_time: item.preparation_time || '15',
        is_available: item.is_available, is_vegetarian: item.is_vegetarian, is_spicy: item.is_spicy,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '', description: '', price: '', discounted_price: '', category: categoryId,
        preparation_time: '15', is_available: true, is_vegetarian: false, is_spicy: false,
      });
    }
    setItemImage(null);
    setItemModal(true);
  };

  const saveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name.trim()) { toast.error('Item name is required'); return; }
    if (!itemForm.price) { toast.error('Price is required'); return; }
    setItemSaving(true);
    try {
      const fd = new FormData();
      Object.entries(itemForm).forEach(([k, v]) => {
        if (k === 'discounted_price' && !v) return;
        fd.append(k, v);
      });
      if (itemImage) fd.append('image', itemImage);

      if (editingItem) {
        await API.patch(`restaurants/${restaurant.slug}/menu/${editingItem.slug}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Item updated');
      } else {
        await API.post(`restaurants/${restaurant.slug}/menu/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Item added');
      }
      setItemModal(false);
      fetchData();
    } catch {
      toast.error('Failed to save item');
    } finally {
      setItemSaving(false);
    }
  };

  const deleteItem = async (item) => {
    try {
      await API.delete(`restaurants/${restaurant.slug}/menu/${item.slug}/`);
      toast.success('Item deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'category') {
      await deleteCat(deleteTarget.data);
    } else {
      await deleteItem(deleteTarget.data);
    }
    setDeleteTarget(null);
  };

  const toggleAvailability = async (item) => {
    try {
      await API.patch(`restaurants/${restaurant.slug}/menu/${item.slug}/`, {
        is_available: !item.is_available,
      });
      fetchData();
    } catch {
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-500">
        Please set up your restaurant first.
      </div>
    );
  }

  // Build items map from restaurant detail
  const itemsByCategory = {};
  restaurant.menu_categories?.forEach((cat) => {
    itemsByCategory[cat.id] = cat.items || [];
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button onClick={() => openCatModal()}
          className="flex items-center gap-2 px-4 py-2 gradient-accent text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition">
          <FiPlus size={16} /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Add your first menu category to get started"
          actionLabel="Add Category"
          onAction={() => openCatModal()}
        />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const items = itemsByCategory[cat.id] || [];
            const isOpen = expanded[cat.id];
            return (
              <div key={cat.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Category header */}
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded((e) => ({ ...e, [cat.id]: !e[cat.id] }))}>
                  <div className="flex items-center gap-3">
                    {isOpen ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
                    <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                    <span className="text-xs text-gray-400">{cat.items_count ?? items.length} items</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openCatModal(cat)} aria-label="Edit category" className="p-1.5 text-gray-400 hover:text-primary-accent"><FiEdit2 size={16} /></button>
                    <button onClick={() => setDeleteTarget({ type: 'category', data: cat })} aria-label="Delete category" className="p-1.5 text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
                  </div>
                </div>

                {/* Items */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    {items.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3 mt-4">
                        {items.map((item) => (
                          <div key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                            <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              <img
                                src={mediaUrl(item.image) || `https://placehold.co/100x100/f3f4f6/9ca3af?text=${encodeURIComponent(item.name[0])}`}
                                alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm text-primary-accent font-medium">{formatPrice(item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Availability toggle */}
                              <button onClick={() => toggleAvailability(item)} aria-label={item.is_available ? 'Mark unavailable' : 'Mark available'}
                                className={`w-10 h-6 rounded-full relative transition ${item.is_available ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.is_available ? 'left-[18px]' : 'left-0.5'}`} />
                              </button>
                              <button onClick={() => openItemModal(cat.id, item)} aria-label="Edit item" className="p-1.5 text-gray-400 hover:text-primary-accent"><FiEdit2 size={14} /></button>
                              <button onClick={() => setDeleteTarget({ type: 'item', data: item })} aria-label="Delete item" className="p-1.5 text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mt-4">No items in this category yet.</p>
                    )}
                    <button onClick={() => openItemModal(cat.id)}
                      className="flex items-center gap-1 mt-4 text-sm text-primary-accent font-medium hover:underline">
                      <FiPlus size={14} /> Add Item
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editingCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setCatModal(false)} aria-label="Close modal"><FiX size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={saveCat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
              </div>
              <button type="submit" disabled={catSaving}
                className="w-full gradient-accent text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60">
                {catSaving ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget?.type === 'category' ? 'Delete Category?' : 'Delete Item?'}
        message={deleteTarget?.type === 'category'
          ? `Delete "${deleteTarget?.data?.name}"? All items in this category will also be deleted.`
          : `Delete "${deleteTarget?.data?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="bg-red-500"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Item Modal */}
      {itemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Item' : 'Add Item'}</h2>
              <button onClick={() => setItemModal(false)} aria-label="Close modal"><FiX size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={saveItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                  <input type="number" step="0.01" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
                  <input type="number" step="0.01" value={itemForm.discounted_price}
                    onChange={(e) => setItemForm({ ...itemForm, discounted_price: e.target.value })} placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-accent/50">
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input type="number" value={itemForm.preparation_time}
                    onChange={(e) => setItemForm({ ...itemForm, preparation_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-accent/50" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                {[
                  { key: 'is_available', label: 'Available' },
                  { key: 'is_vegetarian', label: 'Vegetarian' },
                  { key: 'is_spicy', label: 'Spicy' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={itemForm[key]}
                      onChange={(e) => setItemForm({ ...itemForm, [key]: e.target.checked })}
                      className="w-4 h-4 text-primary-accent border-gray-300 rounded focus:ring-primary-accent" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>

              <ImageUpload label="Image" currentImage={editingItem?.image} onSelect={setItemImage} />

              <div className="flex gap-3">
                <button type="submit" disabled={itemSaving}
                  className="flex-1 gradient-accent text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60">
                  {itemSaving ? 'Saving...' : 'Save'}
                </button>
                {editingItem && (
                  <button type="button" onClick={() => { setItemModal(false); setDeleteTarget({ type: 'item', data: editingItem }); }}
                    className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition">
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
