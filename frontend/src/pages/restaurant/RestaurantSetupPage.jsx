import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import toast from 'react-hot-toast';

const CUISINES = [
  'Pakistani', 'Chinese', 'Fast Food', 'BBQ', 'Pizza', 'Biryani',
  'Desserts', 'Karahi', 'Continental', 'Seafood', 'Thai', 'Other',
];

export default function RestaurantSetupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', cuisine_type: '', address: '', city: '',
    phone: '', email: '', opening_time: '09:00', closing_time: '23:00',
    minimum_order: '0', delivery_fee: '0', estimated_delivery_time: '30',
  });
  const [image, setImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);

  useEffect(() => {
    API.get('restaurants/my-restaurant/')
      .then(({ data }) => {
        setIsEdit(true);
        setForm({
          name: data.name || '',
          description: data.description || '',
          cuisine_type: data.cuisine_type || '',
          address: data.address || '',
          city: data.city || '',
          phone: data.phone || '',
          email: data.email || '',
          opening_time: data.opening_time?.slice(0, 5) || '09:00',
          closing_time: data.closing_time?.slice(0, 5) || '23:00',
          minimum_order: data.minimum_order || '0',
          delivery_fee: data.delivery_fee || '0',
          estimated_delivery_time: data.estimated_delivery_time || '30',
        });
        if (data.image) setCurrentImage(data.image);
        if (data.logo) setCurrentLogo(data.logo);
      })
      .catch(() => {/* no restaurant yet */})
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Restaurant name is required'); return; }
    if (!form.address.trim()) { toast.error('Address is required'); return; }
    if (!form.city.trim()) { toast.error('City is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      if (logo) fd.append('logo', logo);

      if (isEdit) {
        await API.patch('restaurants/my-restaurant/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Restaurant updated!');
      } else {
        await API.post('restaurants/create/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Restaurant created!');
      }
      navigate('/restaurant/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const first = Object.values(data).flat()[0];
        toast.error(typeof first === 'string' ? first : 'Failed to save');
      } else {
        toast.error('Failed to save restaurant');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Edit Restaurant' : 'Set Up Your Restaurant'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
            <select name="cuisine_type" value={form.cuisine_type} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Select cuisine</option>
              {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="03XXXXXXXXX"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
            <input type="time" name="opening_time" value={form.opening_time} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
            <input type="time" name="closing_time" value={form.closing_time} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (Rs.)</label>
            <input type="number" name="minimum_order" value={form.minimum_order} onChange={handleChange} min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (Rs.)</label>
            <input type="number" name="delivery_fee" value={form.delivery_fee} onChange={handleChange} min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (min)</label>
            <input type="number" name="estimated_delivery_time" value={form.estimated_delivery_time} onChange={handleChange} min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <ImageUpload label="Restaurant Image" currentImage={currentImage} onSelect={setImage} />
          <ImageUpload label="Logo" currentImage={currentLogo} onSelect={setLogo} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-60">
          {loading
            ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : isEdit ? 'Update Restaurant' : 'Create Restaurant'}
        </button>
      </form>
    </div>
  );
}
