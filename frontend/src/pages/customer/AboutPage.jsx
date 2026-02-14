import { FiZap, FiStar, FiSmartphone } from 'react-icons/fi';

const MISSIONS = [
  { icon: FiZap, title: 'Fast Delivery', desc: 'Get your favourite food delivered in under 30 minutes. We partner with reliable drivers to bring meals fresh to your door.', gradient: 'from-primary-dark to-primary-mid' },
  { icon: FiStar, title: 'Quality Food', desc: 'We work exclusively with restaurants that meet our quality standards, ensuring every meal is delicious and safe.', gradient: 'from-primary-mid to-primary-accent' },
  { icon: FiSmartphone, title: 'Easy Ordering', desc: 'Browse menus, customise your order, and pay seamlessly — all in a few taps from your phone or computer.', gradient: 'from-primary-accent to-primary-light' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-primary text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-white rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            About <span className="gradient-text">FeastDash</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Pakistan's modern food delivery platform — connecting hungry customers with the best local restaurants.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          FeastDash was born from a simple idea: ordering food should be as enjoyable as eating it.
          Founded in 2024, we set out to build a platform that makes discovering and ordering from local
          restaurants effortless. Today we serve customers across major Pakistani cities, bringing together
          thousands of restaurants and delivery partners on a single, easy-to-use platform. Whether you're
          craving biryani from your favourite dhaba or trying a new gourmet burger joint, FeastDash brings
          the feast to your doorstep.
        </p>
      </section>

      {/* Mission cards */}
      <section className="bg-surface-light dark:bg-surface-dark py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white text-center mb-10">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MISSIONS.map(({ icon: Icon, title, desc, gradient }) => (
              <div key={title} className="bg-white dark:bg-surface-card-dark rounded-2xl p-8 border border-gray-100 dark:border-white/5 text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
