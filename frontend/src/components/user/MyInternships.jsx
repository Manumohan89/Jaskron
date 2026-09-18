import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Briefcase, Loader2, ArrowRight, IndianRupee, Calendar, CheckCircle2, Clock, AlertTriangle, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { internshipApi } from '@/services/internshipService';
import { paymentApi, loadRazorpayScript } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_STYLE = {
  applied: 'bg-amber-500/15 text-amber-400',
  shortlisted: 'bg-sky-500/15 text-sky-400',
  payment_pending: 'bg-amber-500/15 text-amber-400',
  enrolled: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  withdrawn: 'bg-white/10 text-gray-400'
};

const NEXT_STEP = {
  applied: 'We are reviewing your application.',
  shortlisted: 'Shortlisted — pay your programme fee below to confirm your seat.',
  payment_pending: 'Pay your programme fee below to confirm your seat.',
  enrolled: 'You are enrolled. Your classes are under the Classes tab.',
  rejected: 'This application was not taken forward.',
  withdrawn: 'You withdrew this application.'
};

export default function MyInternships() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const load = () => {
    internshipApi
      .myApplications()
      .then((d) => setApps(Array.isArray(d) ? d : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pay = async (app) => {
    setPayingId(app._id);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Could not load the payment gateway. Check your connection and try again.');
        setPayingId(null);
        return;
      }
      const order = await paymentApi.createInternshipOrder(app._id);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'JASKRON Technologies Pvt. Ltd.',
        description: order.programTitle || app.internship?.title,
        prefill: { name: user?.name, email: user?.email },
        handler: async (response) => {
          try {
            await paymentApi.verifyInternshipPayment(app._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success('Payment confirmed — your seat is reserved.');
            load();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
          setPayingId(null);
        },
        modal: { ondismiss: () => setPayingId(null) },
        theme: { color: '#EA580C' }
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start payment');
      setPayingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>;
  }

  if (apps.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
        <Briefcase className="w-9 h-9 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-300 font-medium mb-1">No internship applications yet</p>
        <p className="text-sm text-gray-500 mb-5">
          Our paid programmes include training, live mentorship, an assessment, and a graded certificate.
        </p>
        <Link href="/internships" className="btn-neon inline-block">Browse programmes</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apps.map((a) => {
        const i = a.internship || {};
        const fee = a.amountPayable ?? (i.discountFee > 0 ? i.discountFee : i.fee) ?? 0;
        const paid = a.paymentStatus === 'paid' || a.paymentStatus === 'waived';
        const canPay = !paid && fee > 0 && !['rejected', 'withdrawn'].includes(a.status);
        return (
          <div key={a._id} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="flex">
              <img
                src={i.thumbnail || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=80&w=400&auto=format&fit=crop'}
                alt={i.title}
                className="w-24 sm:w-32 object-cover shrink-0"
              />
              <div className="p-5 flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white truncate">{i.title || 'Internship'}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {i.durationLabel}
                      {i.track ? ` · ${String(i.track).replace('-', ' ')}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize shrink-0 ${STATUS_STYLE[a.status] || 'bg-white/10 text-gray-400'}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-3">{NEXT_STEP[a.status]}</p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                  <span className="flex items-center gap-1 text-gray-400">
                    <IndianRupee className="w-3 h-3" />
                    {fee.toLocaleString('en-IN')}
                    {paid ? (
                      <span className="text-emerald-400 inline-flex items-center gap-1 ml-1">
                        <CheckCircle2 className="w-3 h-3" /> paid
                      </span>
                    ) : (
                      <span className="text-amber-400 inline-flex items-center gap-1 ml-1">
                        <Clock className="w-3 h-3" /> pending
                      </span>
                    )}
                  </span>

                  {a.batch?.name && (
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" /> {a.batch.name}
                      {a.batch.startDate ? ` · ${new Date(a.batch.startDate).toLocaleDateString()}` : ''}
                    </span>
                  )}

                  {i.slug && !canPay && (
                    <Link href={`/internships/${i.slug}`} className="ml-auto text-orange-500 font-medium hover:underline inline-flex items-center gap-1">
                      Programme details <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {canPay && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => pay(a)}
                      disabled={payingId === a._id}
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      {payingId === a._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                      Pay ₹{fee.toLocaleString('en-IN')} to confirm seat
                    </button>
                    {i.slug && (
                      <Link href={`/internships/${i.slug}`} className="text-orange-500 text-xs font-medium hover:underline inline-flex items-center gap-1">
                        Programme details <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {!paid && !canPay && a.status !== 'rejected' && a.status !== 'withdrawn' && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Class links and recordings unlock once your fee payment is confirmed.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
