import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from '../common/BackToTop';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 dark:bg-surface-dark">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
