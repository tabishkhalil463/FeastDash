import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-4">🍽️</div>
      <h1 className="text-7xl font-heading font-bold gradient-text mb-4" style={{WebkitTextFillColor: 'transparent'}}>404</h1>
      <h2 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Looks like this page went out for delivery and never came back. Let's get you back on track.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 gradient-accent text-white rounded-xl font-semibold shadow-lg shadow-primary-accent/25 hover:shadow-xl transition-all duration-200"
      >
        <FiArrowLeft size={18} /> Go Back Home
      </Link>
    </div>
  );
}
