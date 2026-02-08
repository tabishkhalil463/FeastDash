import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import API, { mediaUrl } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiCamera, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  useEffect(() => {
    API.get('auth/profile/')
      .then(({ data }) => {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
        });
        if (data.profile_image) setImagePreview(mediaUrl(data.profile_image));
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => {
        if (key !== 'email') formData.append(key, val);
      });
      if (imageFile) formData.append('profile_image', imageFile);
      await updateProfile(formData);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_new_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      await API.put('auth/change-password/', passwords);
      toast.success('Password changed!');
      setPasswords({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        'Failed to change password';
      toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            style={{ width: 80, height: 80 }}
            className="relative shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser size={32} className="text-gray-400" />
            )}
            <div
              className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity"
              style={{ opacity: avatarHover ? 1 : 0 }}
            >
              <FiCamera className="text-white" size={20} />
            </div>
          </button>
          <div>
            <p className="font-medium text-gray-900">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-sm text-gray-500">{user?.user_type?.replace('_', ' ')}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profile.last_name}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              placeholder="03XXXXXXXXX"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) =>
                setProfile({ ...profile, city: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
        >
          {loading ? (
            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <FiSave size={16} /> Save Changes
            </>
          )}
        </button>
      </form>

      {/* Change Password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.old_password}
              onChange={(e) =>
                setPasswords({ ...passwords, old_password: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) =>
                setPasswords({ ...passwords, new_password: e.target.value })
              }
              placeholder="Min 8 characters"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm_new_password}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirm_new_password: e.target.value,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={pwLoading}
          className="mt-6 flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
        >
          {pwLoading ? (
            <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Change Password'
          )}
        </button>
      </form>
    </div>
  );
}
