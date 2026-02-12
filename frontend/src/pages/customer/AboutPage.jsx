import { FiZap, FiStar, FiSmartphone } from 'react-icons/fi';

const MISSIONS = [
  { icon: FiZap, title: 'Fast Delivery', desc: 'Get your favourite food delivered in under 30 minutes. We partner with reliable drivers to bring meals fresh to your door.' },
  { icon: FiStar, title: 'Quality Food', desc: 'We work exclusively with restaurants that meet our quality standards, ensuring every meal is delicious and safe.' },
  { icon: FiSmartphone, title: 'Easy Ordering', desc: 'Browse menus, customise your order, and pay seamlessly — all in a few taps from your phone or computer.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About <span className="text-primary">Feast</span>Dash</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Pakistan's modern food delivery platform — connecting hungry customers with the best local restaurants.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-600 leading-relaxed">
          FeastDash was born from a simple idea: ordering food should be as enjoyable as eating it.
          Founded in 2024, we set out to build a platform that makes discovering and ordering from local
          restaurants effortless. Today we serve customers across major Pakistani cities, bringing together
          thousands of restaurants and delivery partners on a single, easy-to-use platform. Whether you're
          craving biryani from your favourite dhaba or trying a new gourmet burger joint, FeastDash brings
          the feast to your doorstep.
        </p>
      </section>

      {/* Mission cards */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MISSIONS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team placeholder */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
        <p className="text-gray-500 mb-8">
          A passionate group of foodies, engineers, and designers working to transform food delivery in Pakistan.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {['CEO', 'CTO', 'Design Lead', 'Operations'].map((role) => (
            <div key={role}>
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">Team Member</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
