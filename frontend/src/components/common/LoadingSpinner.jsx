export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
