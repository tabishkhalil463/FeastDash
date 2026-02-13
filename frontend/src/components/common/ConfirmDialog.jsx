import { useEffect } from 'react';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'bg-primary',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-card-dark rounded-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        {message && <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{message}</p>}
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300 transition">
            {cancelLabel}
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 ${confirmColor === 'bg-primary' ? 'gradient-accent' : confirmColor} text-white rounded-xl font-medium hover:opacity-90 transition`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
