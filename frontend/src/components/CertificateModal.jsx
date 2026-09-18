import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, ShieldCheck } from 'lucide-react';
import CertificateTemplate from './CertificateTemplate';

export default function CertificateModal({ certificate, onClose }) {
  const svgRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const handleDownload = async () => {
    if (!svgRef.current) return;
    setDownloading(true);
    try {
      const svgEl = svgRef.current;
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgEl);
      if (!svgString.includes('xmlns=')) {
        svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const scale = 2; // export at 2x for crisp downloads
      const canvas = document.createElement('canvas');
      canvas.width = 1000 * scale;
      canvas.height = 700 * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, 1000, 700);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${certificate.certificateId || 'certificate'}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download certificate', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0c1018] border border-gray-800 rounded-2xl p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-orange-500 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              Verified Certificate
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <CertificateTemplate
            svgRef={svgRef}
            recipientName={certificate.recipientName}
            courseTitle={certificate.courseTitle}
            certificateId={certificate.certificateId}
            issueDate={certificate.issueDate}
            grade={certificate.grade}
            issuedBy={certificate.issuedBy}
            programType={certificate.programType}
            durationLabel={certificate.durationLabel}
            performanceScore={certificate.performanceScore}
            attendancePercent={certificate.attendancePercent}
            mentorRemarks={certificate.mentorRemarks}
          />

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download as PNG
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
