import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { paymentApi, loadRazorpayScript } from '@/services/paymentService';
import { Shield, ChevronRight, Loader2, X, CheckCircle, Lock, Eye, Server, Bug, Cloud, Database, Wifi } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

const ICON_MAP = { shield: Shield, lock: Lock, eye: Eye, server: Server, bug: Bug, cloud: Cloud, database: Database, wifi: Wifi };

export default function MyServices({ headers, user }) {
  const [services, setServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestTarget, setRequestTarget] = useState(null);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [svcRes, reqRes] = await Promise.all([
        axios.get(`${API_URL}/api/services`),
        axios.get(`${API_URL}/api/services/requests/mine`, { headers })
      ]);
      setServices(svcRes.data);
      setMyRequests(reqRes.data);
    } catch {
      setServices([]);
      setMyRequests([]);
    }
    setIsLoading(false);
  };

  const hasRequested = (serviceId) => myRequests.some((r) => r.service?._id === serviceId);

  const openRequest = (service) => {
    setRequestTarget(service);
    setSubmitted(false);
    setForm({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  };

  const payForRequest = async (request) => {
    setSubmitting(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Payment checkout could not load');
      const order = await paymentApi.createServiceOrder(request._id);
      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Jaskron Technologies PVT LTD',
        description: order.serviceTitle,
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await paymentApi.verifyServicePayment(request._id, response);
            setSubmitted(true);
            await fetchAll();
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        theme: { color: '#EA580C' }
      });
      razorpay.open();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Could not start payment');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { request } = (await axios.post(`${API_URL}/api/services/${requestTarget._id}/request`, form, { headers })).data;
      await payForRequest(request);
      return;
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Our Services</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 text-center py-16 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No services available yet</p>
          </div>
        ) : (
          services.map((s) => {
            const Icon = ICON_MAP[s.icon] || Shield;
            const request = myRequests.find((r) => r.service?._id === s._id);
            const requested = Boolean(request);
            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 hover:border-orange-500/30 rounded-2xl p-6 transition-all flex flex-col"
              >
                <Icon className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm flex-1">{s.description}</p>
                {s.features?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {s.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-orange-500/60" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-orange-500 text-sm font-semibold">{s.price}</span>
                  {requested ? (
                    request.paymentStatus === 'paid' ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Paid — in queue</span>
                    ) : (
                      <button onClick={() => payForRequest(request)} disabled={submitting} className="text-xs text-amber-400 hover:text-amber-300">Pay now</button>
                    )
                  ) : (
                    <button
                      onClick={() => openRequest(s)}
                      className="flex items-center gap-1 text-orange-500 text-sm hover:gap-2 transition-all"
                    >
                      Request Service <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Request modal */}
      <AnimatePresence>
        {requestTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setRequestTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-gray-800 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">Request: {requestTarget.title}</h3>
                <button onClick={() => setRequestTarget(null)} className="p-1.5 text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-white font-medium mb-1">Request sent!</p>
                  <p className="text-sm text-gray-500 mb-5">Our team will reach out to you shortly.</p>
                  <button
                    onClick={() => setRequestTarget(null)}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-500 text-white font-medium rounded-xl text-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Phone (optional)</label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-400 mb-1.5 block">Tell us about your needs</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Request
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
