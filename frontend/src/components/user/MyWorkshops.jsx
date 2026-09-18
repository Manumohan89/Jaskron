import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calendar, Clock, Users, Loader2, CheckCircle, XCircle, GraduationCap, IndianRupee, UsersRound, Plus, Trash2, X } from 'lucide-react';
import { paymentApi } from '@/services/paymentService';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function MyWorkshops({ headers }) {
  const [workshops, setWorkshops] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [teamModalWorkshop, setTeamModalWorkshop] = useState(null);
  const [teamAttendees, setTeamAttendees] = useState([{ name: '', email: '' }]);
  const [teamSubmitting, setTeamSubmitting] = useState(false);
  const [teamError, setTeamError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [allRes, mineRes] = await Promise.all([
        axios.get(`${API_URL}/api/workshops`),
        axios.get(`${API_URL}/api/workshops/mine/registrations`, { headers })
      ]);
      setWorkshops(allRes.data);
      setMyRegistrations(mineRes.data);
    } catch {
      setWorkshops([]);
      setMyRegistrations([]);
    }
    setIsLoading(false);
  };

  const myStatusFor = (workshopId) => {
    const reg = myRegistrations.find((r) => r._id === workshopId);
    return reg?.myRegistrationStatus;
  };

  const handleRegister = async (workshop) => {
    const id = workshop._id;
    setActingId(id);
    try {
      if (workshop.isPaid && workshop.price > 0) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert('Could not load payment gateway. Please check your connection and try again.');
          setActingId(null);
          return;
        }
        const order = await paymentApi.createOrder(id);
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'JASKRON Technologies Pvt. Ltd.',
          description: workshop.title,
          handler: async (response) => {
            try {
              await paymentApi.verify(id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              await fetchAll();
            } catch (err) {
              alert(err.response?.data?.message || 'Payment verification failed');
            }
            setActingId(null);
          },
          modal: { ondismiss: () => setActingId(null) },
          theme: { color: '#06b6d4' }
        });
        rzp.open();
        return; // actingId cleared in handler/ondismiss
      }
      await axios.post(`${API_URL}/api/workshops/${id}/register`, {}, { headers });
      await fetchAll();
      setActingId(null);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Failed to register');
      setActingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel your registration for this workshop?')) return;
    setActingId(id);
    try {
      await axios.post(`${API_URL}/api/workshops/${id}/cancel`, {}, { headers });
      await fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
    setActingId(null);
  };

  const openTeamModal = (workshop) => {
    setTeamModalWorkshop(workshop);
    setTeamAttendees([{ name: '', email: '' }]);
    setTeamError('');
  };
  const updateAttendee = (i, field, value) => {
    const next = [...teamAttendees];
    next[i] = { ...next[i], [field]: value };
    setTeamAttendees(next);
  };
  const addAttendeeRow = () => setTeamAttendees((prev) => [...prev, { name: '', email: '' }]);
  const removeAttendeeRow = (i) => setTeamAttendees((prev) => prev.filter((_, idx) => idx !== i));

  const submitTeamRegistration = async (e) => {
    e.preventDefault();
    setTeamError('');
    const validAttendees = teamAttendees.filter((a) => a.name.trim() && a.email.trim());
    if (validAttendees.length === 0) {
      setTeamError('Add at least one attendee with a name and email');
      return;
    }
    setTeamSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/workshops/${teamModalWorkshop._id}/register-team`, { attendees: validAttendees }, { headers });
      setTeamModalWorkshop(null);
      await fetchAll();
    } catch (err) {
      setTeamError(err.response?.data?.error || 'Failed to complete team registration');
    }
    setTeamSubmitting(false);
  };

  const levelColor = {
    Beginner: 'bg-emerald-500/10 text-emerald-400',
    Intermediate: 'bg-amber-500/10 text-amber-400',
    Advanced: 'bg-red-500/10 text-red-400'
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
      <h2 className="text-xl font-bold text-white">Available Workshops</h2>
      {workshops.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No workshops scheduled yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workshops.map((w) => {
            const status = myStatusFor(w._id);
            const isFull = w.enrolledCount >= w.capacity;
            return (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-800 hover:border-orange-500/30 rounded-2xl overflow-hidden transition-all flex flex-col"
              >
                {w.image && (
                  <div className="h-28 overflow-hidden">
                    <img src={w.image} alt={w.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      w.status === 'upcoming'
                        ? 'bg-orange-500/15 text-orange-500'
                        : w.status === 'ongoing'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {w.status}
                  </span>
                  {w.level && <span className={`text-xs px-2 py-1 rounded-full ${levelColor[w.level]}`}>{w.level}</span>}
                </div>
                <h3 className="font-semibold text-white mb-1">{w.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2 flex-1">{w.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> {w.instructor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {w.enrolledCount}/{w.capacity}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  <Calendar className="w-3.5 h-3.5" /> {w.date ? new Date(w.date).toLocaleString() : 'TBA'}
                  <Clock className="w-3.5 h-3.5 ml-2" /> {w.duration}
                </div>

                {status === 'completed' ? (
                  <div className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Completed
                  </div>
                ) : status === 'registered' || status === 'attended' ? (
                  <button
                    onClick={() => handleCancel(w._id)}
                    disabled={actingId === w._id}
                    className="w-full py-2 bg-gray-800 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 text-gray-300 hover:text-red-400 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {actingId === w._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {status === 'attended' ? 'Attended — Cancel?' : "You're Registered — Cancel"}
                  </button>
                ) : isFull ? (
                  <div className="w-full py-2 bg-gray-800 text-gray-500 rounded-xl text-sm font-medium text-center">Workshop Full</div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleRegister(w)}
                      disabled={actingId === w._id}
                      className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-500 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {actingId === w._id && <Loader2 className="w-4 h-4 animate-spin" />}
                      {w.isPaid && w.price > 0 ? (
                        <span className="flex items-center gap-1">Register — <IndianRupee className="w-3.5 h-3.5" />{w.price}</span>
                      ) : (
                        'Register Now'
                      )}
                    </button>
                    <button
                      onClick={() => openTeamModal(w)}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                    >
                      <UsersRound className="w-3.5 h-3.5" /> Register a team instead
                    </button>
                  </div>
                )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {teamModalWorkshop && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setTeamModalWorkshop(null)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitTeamRegistration}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg space-y-4 my-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white flex items-center gap-2"><UsersRound className="w-4 h-4 text-orange-500" /> Register a team</h3>
                <p className="text-xs text-gray-500 mt-0.5">{teamModalWorkshop.title} — colleagues don't need their own accounts</p>
              </div>
              <button type="button" onClick={() => setTeamModalWorkshop(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {teamAttendees.map((a, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={a.name}
                    onChange={(e) => updateAttendee(i, 'name', e.target.value)}
                    placeholder="Full name"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
                  />
                  <input
                    value={a.email}
                    onChange={(e) => updateAttendee(i, 'email', e.target.value)}
                    type="email"
                    placeholder="Email"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
                  />
                  <button type="button" onClick={() => removeAttendeeRow(i)} className="text-gray-500 hover:text-red-400 px-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addAttendeeRow} className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-400">
              <Plus className="w-4 h-4" /> Add another attendee
            </button>

            {teamModalWorkshop.isPaid && teamModalWorkshop.price > 0 && (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                This is a paid workshop (₹{teamModalWorkshop.price}/seat). Team seats are booked as pending payment — we'll follow up with each attendee for payment.
              </p>
            )}

            {teamError && <p className="text-sm text-red-400">{teamError}</p>}

            <button type="submit" disabled={teamSubmitting} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50">
              {teamSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Book ${teamAttendees.filter((a) => a.name.trim() && a.email.trim()).length || ''} seat(s)`}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
