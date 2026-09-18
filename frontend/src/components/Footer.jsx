import { useEffect, useState } from 'react';
import { Github, Twitter, Linkedin, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import Logo from './Logo';
import { COMPANY } from '@/config/company';
import TrustBadges from './TrustBadges';
import { newsletterApi } from '@/services/newsletterService';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

const linkSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  {
    title: 'Learn',
    links: [
      { label: 'Courses', href: '/courses' },
      { label: 'Paid Internships', href: '/internships' },
      { label: 'Projects', href: '/projects' },
      { label: 'Research', href: '/research' },
      { label: 'For Institutions', href: '/institutions' }
    ]
  }
];

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const data = await newsletterApi.subscribe(email, 'footer');
      setMessage(data.message);
      setStatus('done');
      setEmail('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <p className="flex items-center gap-1.5 text-sm text-orange-500">
        <CheckCircle2 className="w-4 h-4" /> {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50 min-w-0"
      />
      <button type="submit" disabled={status === 'loading'} className="shrink-0 bg-orange-500 hover:bg-orange-500 text-white p-2.5 rounded-xl disabled:opacity-60">
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
}

function SystemStatus() {
  const [status, setStatus] = useState('checking'); // checking | operational | degraded

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/health`)
      .then((r) => { if (!cancelled) setStatus(r.ok ? 'operational' : 'degraded'); })
      .catch(() => { if (!cancelled) setStatus('degraded'); });
    return () => { cancelled = true; };
  }, []);

  const color = status === 'operational' ? 'bg-green-500' : status === 'degraded' ? 'bg-red-500' : 'bg-gray-500';
  const label = status === 'operational' ? 'All systems operational' : status === 'degraded' ? 'Service disruption' : 'Checking status...';

  return (
    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
      <div className={`w-1.5 h-1.5 rounded-full ${status === 'operational' ? 'animate-pulse' : ''} ${color}`} />
      {label}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#080808] dark:bg-[#080808] border-t border-gray-800/50 py-12 text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Logo size={40} />
              <div>
                <p className="font-bold text-white text-sm">JASKRON</p>
                <p className="text-[10px] text-orange-500 uppercase tracking-widest">Technologies Private limited</p>
              </div>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              {COMPANY.mission} Technology · Skill Development · Research · Industry Engagement.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a href="mailto:jaskronsecureops@gmail.com" className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-500 hover:text-orange-500 text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Newsletter</h4>
            <p className="text-gray-500 text-sm mb-3">New courses, cohort dates, and openings. No spam.</p>
            <NewsletterForm />
            <ul className="space-y-2 text-sm text-gray-500 mt-5">
              <li>
                <a href="mailto:jaskronsecureops@gmail.com" className="hover:text-orange-500 transition-colors">
                  jaskronsecureops@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+917338078795" className="hover:text-orange-500 transition-colors">
                  +91 7338078795
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-6 pb-5">
          <TrustBadges variant="compact" className="justify-center sm:justify-start" />
        </div>

        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-xs">© 2026 {COMPANY.legalName}. All rights reserved.</p>
            <a href="/.well-known/security.txt" className="text-gray-600 hover:text-orange-500 text-xs transition-colors underline underline-offset-2">
              security.txt
            </a>
          </div>
          <SystemStatus />
        </div>
      </div>
    </footer>
  );
}
