import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-3">
              <span className="text-primary">Feast</span>Dash
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Pakistan&apos;s favourite food ordering platform. Delicious meals from
              local restaurants delivered to your doorstep.
            </p>
            <div className="flex gap-3 mt-4">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <FiFacebook size={16} />
              </span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <FiTwitter size={16} />
              </span>
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer">
                <FiInstagram size={16} />
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/restaurants" className="hover:text-white transition">Restaurants</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><span className="hover:text-white transition cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <FiMail size={14} /> support@feastdash.pk
              </li>
              <li className="flex items-center gap-2">
                <FiPhone size={14} /> 0311-1234567
              </li>
              <li className="flex items-start gap-2">
                <FiMapPin size={14} className="mt-0.5 shrink-0" />
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-white/50">
          &copy; 2025 FeastDash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
