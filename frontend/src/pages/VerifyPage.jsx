import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'wouter';
import axios from 'axios';
import { ShieldCheck, ShieldX, Loader2, ArrowLeft, Award, Calendar, User, BarChart3, Clock } from 'lucide-react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000';

export default function VerifyPage() {
  const { certificateId } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/certificates/verify/${certificateId}`)
      .then((res) => setResult(res.data))
      .catch((err) => setResult(err.response?.data || { valid: false }))
      .finally(() => setIsLoading(false));
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] dark:opacity-[0.12]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614064641938-3bbee52942c7?fm=jpg&q=80&w=1600&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-2xl"
      >
        {isLoading ? (
          <div className="py-10">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Verifying certificate...</p>
          </div>
        ) : result?.valid ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5"
            >
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h1 className="text-xl font-bold mb-1">Certificate Verified</h1>
            <p className="text-muted-foreground text-sm mb-6">This is an authentic JASKRON Technologies Pvt. Ltd. certificate.</p>

            <div className="space-y-3 text-left bg-muted/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="text-sm font-medium">{result.recipientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Course / Achievement</p>
                  <p className="text-sm font-medium">{result.courseTitle}</p>
                </div>
              </div>
              {(result.performanceScore !== undefined && result.performanceScore !== null) || result.attendancePercent !== undefined && result.attendancePercent !== null ? (
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Performance</p>
                    <p className="text-sm font-medium">
                      {result.grade}
                      {result.performanceScore !== undefined && result.performanceScore !== null ? ` · ${result.performanceScore}% score` : ''}
                      {result.attendancePercent !== undefined && result.attendancePercent !== null ? ` · ${result.attendancePercent}% attendance` : ''}
                    </p>
                  </div>
                </div>
              ) : null}
              {result.durationLabel && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-medium">{result.durationLabel}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Issued</p>
                  <p className="text-sm font-medium">{new Date(result.issueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Certificate ID</p>
                <p className="text-sm font-mono">{result.certificateId}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
              <ShieldX className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold mb-1">Certificate Not Found</h1>
            <p className="text-muted-foreground text-sm">
              {result?.message || "This certificate ID doesn't match any record, or it has been revoked."}
            </p>
          </>
        )}

        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-500 mt-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to JASKRON Technologies Pvt. Ltd.
        </Link>
      </motion.div>
    </div>
  );
}
