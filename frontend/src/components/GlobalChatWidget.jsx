import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Sparkles, X, Send, Loader2, Bot } from 'lucide-react';
import { aiApi } from '@/services/aiService';

// Site-wide assistant. Reuses the workshop-advisor endpoint (it already has
// good context on courses) but frames itself as general help, and hides
// itself on the dashboards where it would just be clutter.
export default function GlobalChatWidget() {
  const [location] = useLocation();
  const hideOn = ['/dashboard', '/admin', '/login', '/verify-email', '/login-otp', '/forgot-password'];
  const shouldHide = hideOn.some((p) => location.startsWith(p));

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I can help you find the right workshop, explain our services, or point you to the right page. What are you looking for?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  if (shouldHide) return null;

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const { reply } = await aiApi.askAdvisor(userMsg);
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: "Sorry, I couldn't reach the assistant right now. Try the Contact page for a human." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold px-4 py-3 rounded-full shadow-lg shadow-orange-500/30"
      >
        {open ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        <span className="text-sm hidden sm:inline">{open ? 'Close' : 'Ask JASKRON'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-[90vw] max-w-sm h-[480px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-orange-500/10 to-orange-600/10">
              <Bot className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold">JASKRON Assistant</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl ${m.role === 'user' ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> <span className="text-xs">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={send} className="p-3 border-t border-border flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about workshops, services..."
                className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500/50"
              />
              <button type="submit" disabled={loading} className="p-2.5 bg-orange-500 hover:bg-orange-500 text-white rounded-xl disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
