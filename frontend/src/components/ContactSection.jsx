import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import {
  Mail, Phone, MessageCircle, MapPin, Clock, Loader2, CheckCircle2, ArrowRight,
  Briefcase, Building2, Images
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contactApi } from '@/services/contactService';
import { COMPANY } from '@/config/company';

const TOPICS = [
  { id: 'skill-development', name: 'Skill Development Track' },
  { id: 'internship', name: 'Paid Internship Programme' },
  { id: 'project', name: 'Project Development Support' },
  { id: 'workshop', name: 'Workshop / Bootcamp' },
  { id: 'guest-session', name: 'Industry Guest Session' },
  { id: 'e-learning', name: 'Online Course Enquiry' },
  { id: 'research', name: 'Research & Innovation' },
  { id: 'corporate', name: 'Corporate / Institutional Training' },
  { id: 'careers', name: 'Careers' },
  { id: 'general', name: 'General Inquiry' }
];

const CONTACT_METHODS = [
  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { icon: Phone, label: 'Call Us — Executive Chair', value: '+91 7338078795', href: 'tel:+917338078795' },
  { icon: Phone, label: 'Call Us — Technical Manager', value: '+91 7349012319', href: 'tel:+917349012319' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 7338078795', href: 'https://wa.me/917338078795' },
  { icon: MapPin, label: 'Location', value: `${COMPANY.city}, ${COMPANY.region}, ${COMPANY.country}`, href: '#' }
];

const QUICK_LINKS = [
  { icon: Briefcase, label: 'Browse paid internships', href: '/internships' },
  { icon: Building2, label: 'Book a resource person', href: '/institutions' },
  { icon: Images, label: 'See our gallery', href: '/gallery' }
];

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:border-orange-500 focus:outline-none transition-colors';
const labelClass = 'block text-sm font-medium text-muted-foreground mb-2';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', organization: '', topic: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTopicChange = (value) => setFormData((prev) => ({ ...prev, topic: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.topic || formData.message.trim().length < 5) {
      toast.error('Please fill in your name, email, topic, and at least 5 characters of detail');
      return;
    }
    setIsSubmitting(true);
    try {
      const topicLabel = TOPICS.find((t) => t.id === formData.topic)?.name || formData.topic;
      await contactApi.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        subject: `${topicLabel} — website enquiry`,
        message: formData.message.trim()
      });
      setSent(true);
      toast.success("Thanks — we'll get back to you shortly.");
      setFormData({ name: '', email: '', phone: '', organization: '', topic: '', message: '' });
    } catch (error) {
      toast.error('Could not send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 md:p-8"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-14">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Message sent</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  We usually reply within one to two working days. For anything urgent, call or WhatsApp us directly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm font-medium text-orange-500 hover:underline inline-flex items-center gap-1"
                >
                  Send another message <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXXXXXXX" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>College / Organization</label>
                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} placeholder="Optional" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>What's this about? *</label>
                  <Select value={formData.topic} onValueChange={handleTopicChange}>
                    <SelectTrigger className={`${inputClass} justify-between`}>
                      <SelectValue placeholder="Choose a topic…" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPICS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us a bit more — timelines, batch size, or anything specific you need."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-neon disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {CONTACT_METHODS.map((method) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card hover:border-orange-500/50 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <method.icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{method.label}</p>
                  <p className="font-semibold text-sm truncate">{method.value}</p>
                </div>
              </motion.a>
            ))}

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Response time</p>
                <p className="font-semibold text-sm">Within 1–2 working days</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30">
              <h3 className="font-bold mb-1.5">Prefer to browse first?</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Some of what you're looking for might already have its own page.
              </p>
              <ul className="space-y-2">
                {QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-2.5 text-sm font-medium hover:text-orange-500 transition-colors group">
                      <l.icon className="w-4 h-4 text-orange-500 shrink-0" />
                      {l.label}
                      <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
