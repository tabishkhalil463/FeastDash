import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2 gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
