import { useRef, useState } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { mediaUrl } from '../../services/api';
import toast from 'react-hot-toast';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ImageUpload({ label, currentImage, onSelect, className = '' }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(currentImage ? mediaUrl(currentImage) : null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Image must be under 5 MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    onSelect?.(file);
  };

  const handleClear = () => {
    setPreview(null);
    onSelect?.(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
          >
            <FiX size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition"
        >
          <FiUploadCloud size={24} />
          <span className="text-xs">Upload</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
