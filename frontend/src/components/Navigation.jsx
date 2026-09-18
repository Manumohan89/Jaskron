import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LayoutDashboard, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Courses', href: '/courses' },
  { label: 'Internships', href: '/internships' },
  { label: 'Services', href: '/services' },
  { label: 'Institutions', href: '/institutions' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Careers', href: '/careers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? 'bg-background/95 border-border' : 'bg-background/70 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Logo size={36} />
            </motion.div>
            <div className="hidden sm:block leading-tight">
              <span className="text-foreground font-bold text-sm tracking-wide">JASKRON</span>
              <span className="text-orange-500 text-[9px] block -mt-0.5 font-medium tracking-[0.12em] uppercase">
                Technologies PVT LTD
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {navItems.map((item, i) => {
              const active = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              return (
                <motion.div key={item.href} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link
                    href={item.href}
                    className={`relative text-sm font-medium transition-colors duration-200 ${
                      active ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'
                    }`}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            {user && (
              <Link
                href="/dashboard?tab=assessments"
                title="Assessment Centre"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-orange-500 border border-border hover:border-orange-500/50 rounded-xl transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" /> Assessments
              </Link>
            )}
            {user ? (
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 rounded-xl transition-all shadow-lg shadow-orange-500/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/50 rounded-xl transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu" className="text-orange-500 hover:text-orange-400 transition-colors p-1">
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-border"
            >
              <div className="pb-4 pt-3">
                {[
                  ...navItems,
                  { label: 'Projects', href: '/projects' },
                  { label: 'Research', href: '/research' },
                  { label: 'Team', href: '/team' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'Resources', href: '/resources' },
                  ...(user ? [{ label: 'Assessment Centre', href: '/dashboard?tab=assessments' }] : [])
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2.5 text-sm transition-colors rounded-xl hover:bg-muted ${
                      location === item.href ? 'text-orange-500' : 'text-muted-foreground hover:text-orange-500'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-3 px-3">
                  {user ? (
                    <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex-1 text-center py-2 text-sm bg-orange-500 text-white font-semibold rounded-xl">
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="flex-1 text-center py-2 text-sm border border-border text-muted-foreground rounded-xl">
                        Sign In
                      </Link>
                      <Link href="/login" className="flex-1 text-center py-2 text-sm bg-orange-500 text-white font-semibold rounded-xl">
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
