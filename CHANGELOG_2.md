# Update 2 — logo, real data, certificates, OTP registration

## New brand logo
- Added `components/Logo.jsx` — a unique hexagon + circuit-lock mark (not a
  generic shield icon), used consistently across Navigation, Footer, Login,
  Forgot/Reset Password, Verify Email, User Dashboard, and Admin Dashboard.
- Regenerated `favicon.ico`, PWA icons (`pwa-192x192.png` / `pwa-512x512.png`),
  and the Open Graph share image (`og-image.png`) to match the new mark, so
  link previews and the browser tab icon are consistent with the in-app logo.

## Admin overview — now real data, not a demo
- `GET /api/admin/stats` now returns **real** week-over-week deltas (users,
  contacts, certificates), a real 12-month user signup series, and the 5 most
  recent users/certificates — computed from actual MongoDB documents.
- The dashboard's "User Growth" chart and "System Status" panel were 100%
  hardcoded fake numbers before; they're now a real growth chart plus a
  "Content Overview" panel built from real counts (published posts, resources,
  services, pending requests) and two new "Recently Issued Certificates" /
  "Newest Users" panels.
- The old "Security Event Logs" tab was invented demo text (fake IPs, fake
  timestamps). It's now an **Activity Log** fed by `GET /api/admin/activity`,
  which merges real registration/certificate/workshop/contact events sorted by
  actual timestamp.
- Users/Contacts/Certificates tables already had real backend pagination from
  the previous update; nothing fake was left there.

## Admin Settings — now functional
The old admin "Settings" tab was static read-only text. It's now a working
panel (`AdminSettingsPanel.jsx`) with:
- Editable admin profile (name, phone, organization)
- Admin alert preferences (email on new contact submissions, etc.), saved to
  the database
- Change password
- A **real** system status panel — `GET /api/admin/system-info` reports the
  live Node.js version, DB connection state, server uptime, and whether
  SMTP/Razorpay/Anthropic are actually configured, read straight from
  `process.env` and the live Mongoose connection, not hardcoded.

## User Settings — restyled
`SettingsPanel.jsx` was reorganized into clearer cards (Appearance, Notifications,
Language, Password) and now includes a working light/dark theme switch wired
to the existing `ThemeContext`.

## User Dashboard — real stats, not filler
- The 4th stat card was hardcoded `"Security Score: 92%"` — replaced with a
  real **Unread Notifications** count from `/api/notifications`.
- "Recent Activity" was three invented lines ("Completed Module 3...", etc.)
  — replaced with a real feed built from the user's actual workshop
  registrations and issued certificates, sorted by real timestamps, with
  human-readable relative time ("2h ago").
- The "Security Awareness Score" gradient card (a fabricated 92/100) is now
  **"Your Learning Progress"**: a real attendance-rate bar computed from
  `attended workshops ÷ total registered workshops`, plus the real certificate
  count.

## Certificate template
- Replaced the generic shield/checkmark badge with the new hexagon + lock
  brand mark, so issued certificates visually match the rest of the site.
- Added a subtle hexagon watermark pattern to the certificate background.
- Grade pill now colors green for Distinction/Merit-type grades vs cyan for a
  standard Pass, instead of always being the same color.
- Added a verification URL line (`jaskron.com/verify/<certificateId>`) under
  the certificate ID so a printed/PDF copy is self-describing.

## Registration — real validation + email OTP verification
This was the biggest gap: registration had no confirm-password field, no phone/
organization capture, and no proof the email address was real. Now:
- **Two-step registration.** `POST /api/auth/register` creates the account as
  unverified and emails a 6-digit code (10-minute expiry, 5 wrong-attempt
  lockout, resend with a 45s client-side cooldown). No login token is issued
  until the code is confirmed via the new `/verify-email` page.
- `POST /api/auth/verify-otp` confirms the code and logs the user in.
  `POST /api/auth/resend-otp` issues a fresh code — both responses are
  identical whether or not the email exists, so they can't be used to check
  which emails are registered.
- **Login is blocked for unverified accounts** (`403 EMAIL_NOT_VERIFIED`); the
  frontend automatically redirects to `/verify-email` with the address
  pre-filled instead of just showing an error.
- The registration form now also collects and validates: confirm password
  (must match), phone and organization (optional), and a required Terms &
  Privacy Policy checkbox — none of which existed before.

### ⚠️ Migration note for existing deployments
Because login now requires `emailVerified: true` and that field defaults to
`false`, **any user created before this update will be locked out** the first
time they try to log in. Run this once after deploying:
```
cd backend
npm run migrate:verify-existing
```
This marks all pre-existing accounts as verified without touching anything
else. New registrations going forward go through the OTP flow normally.
`seed:admin` was also updated to mark the seeded admin account verified.

## Things worth implementing next
Roughly in order of impact:

1. **Two-factor login (not just registration OTP).** Right now OTP only
   guards sign-up. A "send a code on login" option (or TOTP/authenticator app
   support) would meaningfully raise the bar for account takeover, which
   matters more for admin accounts than anything else here.
2. **Audit trail for admin actions.** The new Activity Log shows real content
   events (signups, certificates, workshops, contacts) but not "who changed
   what" — e.g. an admin promoting a user to admin, deleting a user, or
   editing a workshop isn't logged anywhere. Worth a dedicated `AuditLog`
   collection if this ever needs to answer "who did this and when."
3. **Session/device management.** Users can't see or revoke other active
   sessions. With refresh tokens now living for 7 days, a "log out of all
   devices" button (invalidate all refresh tokens for a user) is a natural
   next step, especially paired with #1.
4. **File antivirus/type scanning for resource uploads.** The admin resource
   uploader currently trusts file extension + MIME type from the browser.
   For anything facing the public internet, scanning uploads (or at minimum
   re-validating file signatures server-side) closes an easy gap.
5. **Rate limiting and account lockout as a broader policy.** Auth routes are
   covered; consider similar protection on the AI advisor endpoint and the
   public contact form to prevent abuse/spam at scale.
6. **Automated tests.** There's no test suite yet anywhere in the project.
   Even a thin layer covering auth (register → OTP → login), payments
   (order → verify), and certificate issuance would catch regressions before
   they reach production — these are the flows most likely to break silently.
7. **Remaining Quality/Polish items from the original list** (#12–18): proper
   loading skeletons instead of spinners, analytics (Umami/Plausible), and a
   fully wired PWA offline experience were scoped out of both passes so far.
8. **Backup/restore story for MongoDB.** Nothing here addresses what happens
   if the database needs to be restored — worth documenting or automating
   before this goes to real users.

Happy to pick up any of these — just say which one(s).
