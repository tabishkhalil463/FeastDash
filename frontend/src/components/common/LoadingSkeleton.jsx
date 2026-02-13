export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white dark:bg-surface-card-dark rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-white/5 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/2" />
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex gap-4 bg-white dark:bg-surface-card-dark rounded-xl border border-gray-100 dark:border-white/10 p-4 animate-pulse">
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gray-200 dark:bg-white/5 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-white/5 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-full" />
        <div className="h-5 bg-gray-200 dark:bg-white/5 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8, Component = RestaurantCardSkeleton }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
