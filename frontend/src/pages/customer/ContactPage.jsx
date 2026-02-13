import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/auth/contact/', form);
      toast.success(res.data.message);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { Icon: FiMail, label: 'Email', value: 'support@feastdash.pk' },
    { Icon: FiPhone, label: 'Phone', value: '+92 311 1234567' },
    { Icon: FiMapPin, label: 'Address', value: 'Johar Town, Lahore, Pakistan' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="gradient-primary py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-white rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Get In Touch
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form card */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white dark:bg-surface-card-dark rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100 dark:border-white/10"
          >
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">
              Send us a message
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(e) => update('subject', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent transition"
                placeholder="What's this about?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message *
              </label>
              <textarea
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-accent/50 focus:border-primary-accent transition resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-8 py-3 gradient-accent text-white rounded-xl font-semibold shadow-lg shadow-primary-accent/25 hover:shadow-xl hover:shadow-primary-accent/30 transition-all duration-200 disabled:opacity-60"
            >
              <FiSend size={16} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {/* Contact info sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-card-dark rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-white/10">
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-lg mb-6">
                Contact Info
              </h3>
              <div className="space-y-5">
                {contactInfo.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-11 h-11 gradient-accent rounded-xl flex items-center justify-center shrink-0 shadow-md">
                      <Icon className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Working hours */}
            <div className="bg-white dark:bg-surface-card-dark rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-white/10">
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-lg mb-4">
                Working Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Mon - Fri</span>
                  <span className="font-medium text-gray-900 dark:text-white">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Saturday</span>
                  <span className="font-medium text-gray-900 dark:text-white">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Sunday</span>
                  <span className="font-medium text-primary-accent">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
