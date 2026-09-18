import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// An elegant, print-ready certificate rendered as SVG.
// `forwardedRef` lets parent components serialize this SVG to PNG for download.
export default function CertificateTemplate({
  recipientName = 'Recipient Name',
  courseTitle = 'Course Title',
  certificateId = 'JSO-0000-0000',
  issueDate,
  grade = 'Pass',
  issuedBy = 'JASKRON Technologies Pvt. Ltd.',
  programType,
  durationLabel,
  performanceScore,
  attendancePercent,
  mentorRemarks,
  svgRef
}) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificateId}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 0,
      width: 200,
      color: { dark: '#0a0e14', light: '#ffffff' }
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [certificateId]);

  const formattedDate = issueDate
    ? new Date(issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const g = (grade || '').toLowerCase();
  const isTop = g.includes('distinction') || g.includes('merit') || g.includes('excellent');
  const pillColor = isTop ? '#34d399' : '#F2721F';

  const programPhrase =
    programType === 'internship' ? 'internship program' : programType === 'workshop' ? 'workshop' : 'training program';
  const completionSentence = `has successfully completed the ${durationLabel ? `${durationLabel} ` : ''}${programPhrase}`;

  // Grade pill widens to fit score/attendance when those are present, without
  // disturbing anything else in the layout.
  const pillParts = [`GRADE: ${(grade || 'PASS').toUpperCase()}`];
  if (performanceScore !== undefined && performanceScore !== null && performanceScore !== '') {
    pillParts.push(`SCORE: ${Math.round(Number(performanceScore))}%`);
  }
  if (attendancePercent !== undefined && attendancePercent !== null && attendancePercent !== '') {
    pillParts.push(`ATTENDANCE: ${Math.round(Number(attendancePercent))}%`);
  }
  const pillText = pillParts.join('   •   ');
  const pillWidth = Math.min(860, Math.max(144, pillText.length * 7.4));

  const remarksLine = mentorRemarks
    ? `“${mentorRemarks.length > 110 ? `${mentorRemarks.slice(0, 107)}…` : mentorRemarks}”`
    : null;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 700"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto rounded-lg shadow-2xl"
      style={{ background: '#0a0e14' }}
    >
      <defs>
        <linearGradient id="certBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0e14" />
          <stop offset="50%" stopColor="#0d1420" />
          <stop offset="100%" stopColor="#0a0e14" />
        </linearGradient>
        <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F2721F" stopOpacity="0" />
          <stop offset="50%" stopColor="#F2721F" stopOpacity="1" />
          <stop offset="100%" stopColor="#F2721F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F2721F" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a3792f" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
        <pattern id="hexWatermark" width="120" height="104" patternUnits="userSpaceOnUse">
          <path d="M60 4L110 30V78L60 104L10 78V30Z" fill="none" stroke="#1e293b" strokeWidth="1" strokeOpacity="0.5" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="1000" height="700" fill="url(#certBg)" />
      <rect width="1000" height="700" fill="url(#grid)" opacity="0.35" />
      <rect width="1000" height="700" fill="url(#hexWatermark)" opacity="0.4" />

      {/* Ornamental double border, gold outer + cyan inner — reads as a formal
          certificate rather than a plain card */}
      <rect x="16" y="16" width="968" height="668" fill="none" stroke="#3a3320" strokeWidth="1" />
      <rect x="24" y="24" width="952" height="652" fill="none" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.55" />
      <rect x="34" y="34" width="932" height="632" fill="none" stroke="#F2721F" strokeWidth="1" strokeOpacity="0.35" />

      {/* Corner flourishes */}
      {[[42, 42, 0], [958, 42, 90], [958, 658, 180], [42, 658, 270]].map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <path d="M0,0 L36,0 M0,0 L0,36" stroke="#d4af37" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="6" cy="6" r="2" fill="#d4af37" fillOpacity="0.8" />
        </g>
      ))}

      {/* Header badge — brand hex + lock mark, matches the JASKRON logo */}
      <g transform="translate(500,94) scale(1.1)">
        <path d="M0,-30L26,-15V15L0,30L-26,15V-15Z" fill="url(#badgeGrad)" />
        <path d="M0,-30L26,-15V15L0,30L-26,15V-15Z" fill="none" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="-8.5" y="-1" width="17" height="13.5" rx="3" fill="#ffffff" />
        <path d="M-5,-1V-4.5C-5,-7.5 -2.5,-10 0,-10C2.5,-10 5,-7.5 5,-4.5V-1" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <circle cx="0" cy="4.5" r="2.2" fill="#D9601A" />
      </g>

      <text x="500" y="155" textAnchor="middle" fill="#d4af37" fontSize="12" fontWeight="600" letterSpacing="5" fontFamily="Georgia, serif">
        JASKRON TECHNOLOGIES PVT. LTD.
      </text>

      <rect x="370" y="172" width="260" height="1.5" fill="url(#goldLine)" />

      <text x="500" y="222" textAnchor="middle" fill="#ffffff" fontSize="36" fontWeight="700" fontFamily="Georgia, serif" letterSpacing="0.5">
        Certificate of Achievement
      </text>

      <text x="500" y="258" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="Georgia, serif" fontStyle="italic">
        This certifies that
      </text>

      <text x="500" y="313" textAnchor="middle" fill="#F2721F" fontSize="40" fontWeight="700" fontFamily="Georgia, serif">
        {recipientName}
      </text>
      <path d="M330,332 Q500,344 670,332" fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity="0.6" />

      <text x="500" y="370" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="Georgia, serif" fontStyle="italic">
        {completionSentence}
      </text>

      <text x="500" y="408" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="600" fontFamily="Arial, sans-serif">
        {courseTitle}
      </text>

      {/* Grade pill — widens to include score/attendance when the certificate carries them */}
      <g transform="translate(500,444)">
        <rect x={-pillWidth / 2} y="-16" width={pillWidth} height="32" rx="16" fill={pillColor} fillOpacity="0.12" stroke={pillColor} strokeOpacity="0.5" />
        <text x="0" y="5" textAnchor="middle" fill={pillColor} fontSize="13" fontWeight="700" letterSpacing="1.5" fontFamily="Arial, sans-serif">
          {pillText}
        </text>
      </g>

      <rect x="370" y="480" width="260" height="1" fill="url(#cyanLine)" />

      {/* Mentor remarks — optional, sits in the gap above the seal/date row */}
      {remarksLine && (
        <text x="500" y="504" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="Georgia, serif" fontStyle="italic">
          {remarksLine}
        </text>
      )}

      {/* Footer row — three clearly separated columns so nothing overlaps:
          Date (left) · Seal + Signature (center) · QR + verify (right) */}

      {/* Date column */}
      <g>
        <line x1="110" y1="560" x2="270" y2="560" stroke="#475569" strokeWidth="1" />
        <text x="190" y="583" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600" fontFamily="Arial, sans-serif">
          {formattedDate}
        </text>
        <text x="190" y="601" textAnchor="middle" fill="#64748b" fontSize="10" letterSpacing="1.5" fontFamily="Arial, sans-serif">
          DATE ISSUED
        </text>
      </g>

      {/* Wax-seal style emblem + signature, center column */}
      <g transform="translate(500,548)">
        <circle r="26" fill="url(#sealGrad)" />
        <circle r="26" fill="none" stroke="#7a5c1e" strokeWidth="1" />
        <circle r="21" fill="none" stroke="#fff3d0" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="2,3" />
        <path d="M-9,3 L-3,10 L10,-8" fill="none" stroke="#fff8e6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <line x1="420" y1="596" x2="580" y2="596" stroke="#475569" strokeWidth="1" />
      <text x="500" y="614" textAnchor="middle" fill="#cbd5e1" fontSize="13" fontWeight="600" fontFamily="Georgia, serif" fontStyle="italic">
        {issuedBy}
      </text>
      <text x="500" y="631" textAnchor="middle" fill="#64748b" fontSize="10" letterSpacing="1.5" fontFamily="Arial, sans-serif">
        AUTHORIZED SIGNATURE
      </text>

      {/* QR column — self-contained, well clear of the date/signature columns */}
      <g transform="translate(792,536)">
        {qrDataUrl && (
          <>
            <rect x="-4" y="-4" width="60" height="60" rx="5" fill="#ffffff" />
            <image href={qrDataUrl} x="0" y="0" width="52" height="52" />
          </>
        )}
        <text x="26" y="70" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1.5" fontFamily="Arial, sans-serif">
          SCAN TO VERIFY
        </text>
      </g>

      {/* Bottom strip — comfortably below every column above, no overlap */}
      <text x="500" y="655" textAnchor="middle" fill="#475569" fontSize="11" letterSpacing="2" fontFamily="monospace">
        CERTIFICATE ID: {certificateId}
      </text>
    </svg>
  );
}
