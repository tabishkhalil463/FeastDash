import { Link } from 'react-router-dom';
import logoWhite from '../../assets/logo-white.svg';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';

const socialLinks = [
  { Icon: FiFacebook, label: 'Facebook' },
  { Icon: FiTwitter, label: 'Twitter' },
  { Icon: FiInstagram, label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="gradient-primary text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <img src={logoWhite} alt="FeastDash" className="h-10" />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Pakistan&apos;s premium food ordering platform. Delicious meals from
              your favourite local restaurants delivered to your doorstep.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, label }) => (
                <span
                  key={label}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-200 cursor-pointer"
                  aria-label={label}
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/restaurants" className="hover:text-white transition-colors duration-200">Restaurants</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors duration-200">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><span className="hover:text-white transition cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Help Center</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Privacy Policy</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <FiMail size={14} />
                </span>
                support@feastdash.pk
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <FiPhone size={14} />
                </span>
                0311-1234567
              </li>
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <FiMapPin size={14} />
                </span>
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/40">
          <span>&copy; 2026 FeastDash. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <FiHeart size={12} className="text-primary-accent" /> in Pakistan
          </span>
        </div>
      </div>
    </footer>
  );
}
