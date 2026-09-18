import { Router } from 'express';
import https from 'https';
import tls from 'tls';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = Router();

function normalizeHost(input) {
  let host = input.trim().toLowerCase();
  host = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  return host;
}

function checkTls(host) {
  return new Promise((resolve) => {
    const socket = tls.connect({ host, port: 443, servername: host, timeout: 6000 }, () => {
      const cert = socket.getPeerCertificate();
      const protocol = socket.getProtocol();
      const validTo = cert?.valid_to ? new Date(cert.valid_to) : null;
      const daysRemaining = validTo ? Math.floor((validTo - Date.now()) / (1000 * 60 * 60 * 24)) : null;
      resolve({
        ok: true,
        protocol,
        issuer: cert?.issuer?.O || cert?.issuer?.CN || 'Unknown',
        validTo: validTo?.toISOString() || null,
        daysRemaining,
        isModernProtocol: protocol === 'TLSv1.3' || protocol === 'TLSv1.2'
      });
      socket.end();
    });
    socket.on('error', () => resolve({ ok: false }));
    socket.on('timeout', () => { socket.destroy(); resolve({ ok: false }); });
  });
}

function checkHeaders(host) {
  return new Promise((resolve) => {
    const req = https.request({ host, port: 443, path: '/', method: 'GET', timeout: 6000 }, (res) => {
      resolve({ ok: true, headers: res.headers, statusCode: res.statusCode });
      res.resume();
    });
    req.on('error', () => resolve({ ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false }); });
    req.end();
  });
}

// Free, real, public-facing security posture check: TLS certificate health +
// presence of key security headers. No breach-database lookup (HaveIBeenPwned
// requires a paid API key as of 2024) — flagged clearly in the response instead
// of faking it.
router.post('/scan', generalLimiter, async (req, res) => {
  try {
    const host = normalizeHost(req.body.domain || '');
    if (!host || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
      return res.status(400).json({ message: 'Enter a valid domain, e.g. example.com' });
    }

    const [tlsResult, headerResult] = await Promise.all([checkTls(host), checkHeaders(host)]);

    const securityHeaders = [
      { key: 'strict-transport-security', label: 'HSTS (Strict-Transport-Security)' },
      { key: 'x-content-type-options', label: 'X-Content-Type-Options' },
      { key: 'x-frame-options', label: 'X-Frame-Options' },
      { key: 'content-security-policy', label: 'Content-Security-Policy' },
      { key: 'referrer-policy', label: 'Referrer-Policy' }
    ];

    const headerChecks = securityHeaders.map((h) => ({
      label: h.label,
      present: headerResult.ok ? Boolean(headerResult.headers?.[h.key]) : false
    }));

    let score = 0;
    const maxScore = 100;
    if (tlsResult.ok) {
      score += 30;
      if (tlsResult.isModernProtocol) score += 15;
      if (tlsResult.daysRemaining !== null && tlsResult.daysRemaining > 14) score += 10;
    }
    score += headerChecks.filter((h) => h.present).length * 9; // 5 headers × 9 = 45

    res.json({
      domain: host,
      score: Math.min(maxScore, score),
      tls: tlsResult.ok ? tlsResult : { ok: false, message: 'Could not establish a TLS connection on port 443' },
      headers: headerChecks,
      headerCheckAvailable: headerResult.ok,
      breachCheckNote: 'Breach-database lookup is not included — HaveIBeenPwned now requires a paid API key. Ask us about adding this with your own key.',
      scannedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: 'Scan failed', detail: err.message });
  }
});

export default router;
