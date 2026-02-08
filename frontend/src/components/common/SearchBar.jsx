import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchBar({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSubmit,
  debounceMs = 300,
  className = '',
}) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);

  useEffect(() => setLocal(value), [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setLocal(v);
    if (onChange) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(v), debounceMs);
    }
  };

  const handleClear = () => {
    setLocal('');
    onChange?.('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit(local);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
}
