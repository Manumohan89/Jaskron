# What's new in this update

This pass implemented the 🔴 Critical security fixes (#1–5), the 🟡 High Impact
items (#6–11), plus the Settings / Notifications / Resources pages you asked for.
Quality/Polish (#12–18) and Advanced (#19–22 except the AI chatbot, which is included)
were **not** done in this pass — say the word and I'll pick those up next.

## 🔴 Critical security fixes

1. **Password hashing** — `User.js` now hashes passwords with `bcryptjs` (12 salt
   rounds) instead of SHA-256. Existing plaintext/SHA-256 hashes in a live DB will
   need a forced password reset since bcrypt can't "upgrade" an old hash.
2. **Token expiry + refresh** — access tokens now expire in 15 minutes, refresh
   tokens last 7 days. `POST /api/auth/refresh` exchanges one for the other. The
   frontend's axios client (`services/api.js`) and `AuthContext` both auto-refresh
   on a `401 TOKEN_EXPIRED` response and retry the original request — sessions no
   longer die silently.
3. **Rate limiting** — `express-rate-limit` caps `/api/auth/login`, `/register`,
   `/forgot-password`, and `/reset-password` at 5 attempts / 15 minutes per IP.
4. **Input validation** — `zod` schemas (`schemas/authSchemas.js`) validate email
   format, password length (8+), and sanitize registration/login/contact payloads
   server-side, independent of Mongoose's `required: true`.
5. **JWT_SECRET safety** — the server now **refuses to boot in production** if
   `JWT_SECRET` is unset, instead of silently falling back to the old hardcoded
   `'jaskron-secret-key-2024'`. In dev it warns loudly instead.
6. **Contacts endpoint was wide open** — `GET /api/contacts` had no auth check at
   all; anyone could read every contact-form submission (names, emails, messages).
   It's now admin-only; only `POST /` (the form itself) stays public.

## 🟡 High Impact

6. **Email notifications** — `utils/email.js` wraps Nodemailer (SMTP — works with
   Gmail app passwords or Resend's SMTP bridge). Sends: welcome email on register,
   workshop confirmation with a `.ics` calendar attachment, admin notification on
   contact-form submit, and certificate-issued email. If SMTP env vars aren't set,
   emails just log to console instead of failing — dev works out of the box.
7. **Blog / Knowledge Base** — `BlogPost` model, admin CMS (`BlogManager.jsx`,
   create/edit/publish, draft vs published), public `/blog` listing + `/blog/:slug`
   detail page with SEO meta tags.
8. **Testimonials** — `Testimonial` model, admin CRUD (`TestimonialsManager.jsx`),
   and an auto-rotating carousel on the home page.
9. **Razorpay payments** — workshops can be marked paid with an INR price. Frontend
   uses Razorpay Checkout; backend verifies the payment signature before confirming
   registration. **Certificates for paid workshops now require a confirmed payment**
   — issuing one without payment returns a 400.
10. **Forgot / reset password** — `/forgot-password` and `/reset-password/:token`
    pages, backed by a time-limited (1hr), hashed reset token. Same response
    whether or not the email exists, so it doesn't leak registered emails.
11. **QR check-in** — admins generate a per-workshop QR code (`CheckInPanel.jsx`);
    scanning/checking in marks a registration `attended`, which is what unlocks
    the "issue certificate" shortcut already in `WorkshopsManager`.

## New pages you asked for

- **Settings** (`/dashboard` → Settings tab) — notification preferences, language
  choice (English/Hindi/Kannada, scaffolded with `react-i18next`), and change
  password.
- **Notifications** — a bell icon with a live dropdown (Socket.io push, no refresh
  needed) plus a full notifications tab with mark-read/delete/pagination.
- **Resources** — admins upload files (PDF/Office/zip/images, 25MB cap) with a
  category and public/members-only toggle from the admin panel; a public
  `/resources` page and a dashboard tab let people search and download them.

## AI workshop advisor (#22)

A floating chat widget on `/workshops` (`WorkshopAdvisorWidget.jsx`) calls
`POST /api/ai/workshop-advisor`, which uses the Claude API to recommend a
workshop from your live catalog based on what the visitor describes. Falls back
to simple keyword matching if `ANTHROPIC_API_KEY` isn't set.

## Also fixed while in there

- Admin **user search now actually filters** (previously wired to state but
  unused) and both users + contacts + certificates tables are **paginated
  server-side, 10 per page**, per item #16.
- Real-time notifications (#19) — Socket.io pushes certificate/workshop/contact
  events to logged-in users instantly.

## Setup notes

- Backend: `cd backend && npm install`, copy `.env.example` → `.env` and fill in
  `JWT_SECRET` (required), SMTP creds (optional, for email), `RAZORPAY_KEY_ID` /
  `RAZORPAY_KEY_SECRET` (optional, for paid workshops), `ANTHROPIC_API_KEY`
  (optional, for the AI advisor).
- Frontend: `cd frontend && npm install`, copy `.env.example` → `.env`.
- Existing users in the DB were hashed with SHA-256 — after this deploy they'll
  need to use "Forgot password" once to get a bcrypt hash, since old hashes won't
  verify against the new scheme.

---

# Round 2 — logo, real data, OTP registration, certificate & settings polish

## New unique logo

Replaced the generic "shield in a gradient box" mark used everywhere with a real
brand mark: `components/Logo.jsx`, a hexagonal shield containing a padlock with
circuit-node accents, as inline SVG (crisp at any size, no image request). Swapped
in on the navbar, footer, login/forgot/reset/verify pages, both dashboards, and
the certificate template. Regenerated `favicon.ico`, the PWA icons, and the
Open Graph share image to match.

## Admin overview was partly hardcoded — now real

- The **User Growth chart** was a hardcoded `[35, 52, 48, ...]` array. It's now
  `GET /api/admin/stats` returning actual monthly signups for the last 12 months
  via a Mongo aggregation.
- The **System Status panel** (API uptime, DB health %, cache hit rate) was
  entirely made up — those aren't numbers this app can honestly produce. Replaced
  with a **Content Overview** panel of real counts (published posts, resources,
  active services, pending requests) plus new **Recently Issued Certificates**
  and **Newest Users** panels.
- The **percentage deltas** on the stat cards ("+12%", "+23%"...) were fake.
  They're now real week-over-week comparisons computed server-side.
- Admin **Security Logs** tab was six lines of fabricated log lines. Replaced with
  `ActivityFeed.jsx`, a real feed merging actual registration/certificate/workshop/
  contact timestamps from the database (`GET /api/admin/activity`).
- Admin **Settings** tab was static, non-editable text ("Site Name: JASKRON...").
  Replaced with `AdminSettingsPanel.jsx`: real profile editing, working password
  change, real notification preferences, and a **System Status** section that
  reads live values from the running server (env, DB connection state, uptime,
  token TTLs, whether SMTP/Razorpay/the AI advisor are actually configured) —
  genuinely real, not decorative.

## User dashboard was partly hardcoded — now real

- The 4th stat card was a fixed **"Security Score: 92%"** with no way to earn or
  move it. Replaced with **Unread Notifications**, a real live count.
- **Recent Activity** was three fixed strings ("Completed Module 3...",
  hardcoded "2h ago" timestamps that never changed). Replaced with a feed built
  from the user's actual workshop registrations and issued certificates, sorted
  by real timestamp, with genuine relative time ("3h ago", "2d ago").
- The **Security Awareness Score** gradient card (a fabricated "92/100, +8 this
  month") is now **Your Learning Progress**: a real attendance-rate bar computed
  from `attended workshops / total registrations`, plus your real certificate
  count. No number is invented.

## Registration now requires email verification (OTP)

- `User` model gained `emailVerified`, `otpCodeHash`, `otpExpires`, `otpAttempts`.
- `POST /api/auth/register` no longer logs the user in — it creates an unverified
  account and emails a 6-digit code (10 min expiry, 5 wrong-attempt lockout).
- New `POST /api/auth/verify-otp` confirms the code and returns tokens (this is
  the actual "login" moment now). New `POST /api/auth/resend-otp` for a fresh
  code, rate-limited and with a 45s cooldown client-side.
- `POST /api/auth/login` now rejects unverified accounts with
  `403 EMAIL_NOT_VERIFIED` and redirects to the verify screen instead of a dead
  end.
- New `/verify-email` page: 6 separate digit boxes, auto-advance, paste support,
  resend with cooldown.
- **Registration form itself was missing fields** — added optional phone and
  organization, a required confirm-password field, and a required "I agree to
  Terms & Privacy" checkbox (previously that text was decorative, not enforced).
- ⚠️ **Migration needed**: existing accounts don't have `emailVerified` set and
  would be locked out by this change. Run `npm run migrate:verify-existing` in
  `backend/` once after deploying (`seedAdmin.js` was also updated so re-seeding
  the admin sets `emailVerified: true` automatically).

## Certificate template

- Swapped the generic checkmark-shield badge for the same hex+lock brand mark
  used everywhere else, so a certificate is recognizably "from" this exact site.
- Added a subtle hexagon watermark pattern across the background.
- Grade pill now colors green for Distinction/Merit-type grades vs cyan for a
  plain Pass, instead of always being the same color regardless of grade.
- Added a "Verify at jaskron.com/verify/&lt;id&gt;" line under the certificate ID.

## User & Admin Settings — interface pass

- User `SettingsPanel.jsx` restructured into clearly labeled cards (Appearance,
  Notifications, Language, Password) with a working light/dark toggle wired to
  the existing theme system (previously Settings had no appearance control at
  all even though the toggle existed elsewhere in the app).
- Admin now has an equivalent, actually-functional settings page for the first
  time (see above) instead of a static demo screen.

## Suggested next steps

Below is a candid list of what I'd tackle next, roughly in priority order:

1. **Two-factor login (not just registration OTP)** — right now OTP only gates
   sign-up. Consider optional TOTP or email-OTP on login for admin accounts
   specifically, since they're the highest-value target.
2. **Audit logging with real actor tracking** — the new Activity Log shows *what*
   happened but not *who* did it for admin actions (e.g. which admin issued a
   given certificate or deleted a user). Worth adding an `actor` field to a
   proper `AuditLog` collection if this ever needs to pass a security review.
3. **Avatar upload** — profile photos are currently just a URL string field;
   there's no actual upload flow. Resources already have file upload wired up
   (multer) so this is a small lift to replicate for avatars.
4. **Rate-limit the OTP endpoints per-account, not just per-IP** — right now
   `express-rate-limit` is IP-based; someone behind a shared/corporate IP could
   get throttled by other people's attempts. Worth moving to a per-email lockout
   using the `otpAttempts` field pattern already in place for OTP.
5. **Session/device management page** — "log out of all devices" isn't possible
   since refresh tokens aren't tracked server-side (they're stateless HMAC).
   Would need a refresh-token allowlist/blocklist in Mongo to support this.
6. **Automated tests** — there currently aren't any. Even a thin layer (auth flow,
   payment signature verification, OTP expiry/lockout) would catch regressions
   before they reach users, especially given how much of this app is security
   surface area.
7. **The quality/polish items from the original list that are still open**:
   skeleton loaders instead of spinners, analytics (Umami/Plausible), and the
   public certificate LinkedIn-sharing page (#20) — the QR/verify infrastructure
   for it already exists, this is mostly a frontend page.
8. **Image optimization** — resource/blog cover images aren't resized/compressed
   on upload; for a real deployment you'd want to pipe uploads through `sharp`
   (already available in this environment) before saving.


---

# Round 3 — trust & credibility, B2B, compliance, growth infra

Implemented as much of the "add all" list as is realistic without external
accounts (Discord, SSO contracts, a HaveIBeenPwned API key, an uptime-monitoring
subscription, video/CDN storage). Everything below is real, working code.

## Trust & credibility

- **Partner/client logos** — `Partner` model + admin manager (`PartnersManager.jsx`)
  + a "Trusted by teams at" strip on the homepage. Starts empty; add real logos
    from the admin panel whenever you have client permission to display them.
- **Case studies** — `CaseStudy` model with before/after metrics, admin CRUD, a
  public `/case-studies` listing + detail page, and a homepage teaser section.
  Metrics render as "32% → 4%" style stat cards.
- **Team certifications** — `TeamMember` gained a `certifications` array (CEH,
  OSCP, CISSP, etc.), shown as badges on both the public Team page and a new
  admin **Team** tab (which didn't exist before — team members previously
  weren't manageable from the admin panel at all).
- **Free security scorecard tool** — `/security-scorecard`: enter a domain, get
  a real TLS certificate check (protocol, issuer, expiry) and a scan for 5 key
  security headers (HSTS, CSP, X-Frame-Options, etc.), computed live server-side
  with Node's built-in `tls`/`https` modules — no fake data. Breach-database
  lookup is intentionally **not** included and the tool says so explicitly:
  HaveIBeenPwned now requires a paid API key, so faking that check would be
  worse than omitting it.
- **security.txt** — real RFC 9116 file at `/.well-known/security.txt`, linked
  from the footer.
- ⚠️ **Not built**: an uptime status page. The footer's "All systems
  operational" indicator now pings the real `/health` endpoint instead of being
  a hardcoded green dot, but a proper public status page (historical incidents,
  per-service status) needs a monitoring subscription (e.g. Better Uptime,
  UptimeRobot) — happy to wire one in once you pick a provider.

## B2B / Enterprise

- **`/enterprise` page** with a company inquiry form (`EnterpriseInquiry` model,
  emails + in-app notifies admins on submit, admin manager to track status:
  new/contacted/closed).
- **Bulk/team workshop registration** — a logged-in user can now book multiple
  seats at once for colleagues by name + email; those colleagues don't need
  accounts. Each seat gets its own confirmation email + calendar invite. Admins
  see these as regular registrations (with `guestName`/`guestEmail`) in the
  existing workshop registration list and QR check-in flow.
- ⚠️ **Not built**: SSO for enterprise clients and white-label certificates —
  both need a specific contract/IdP per client (SAML metadata, co-branding
  assets) that can't be generically wired up in advance.

## Compliance

- **Cookie consent banner** — appears once, remembers the choice in
  localStorage. Honest copy: this site only uses cookies for login sessions and
  preferences, no third-party ad/tracking cookies exist to consent to.
- ⚠️ **Not built**: a full WCAG accessibility audit and a self-service "export/
  delete my data" flow. Both are real, valuable, but open-ended enough that they
  deserve their own dedicated pass rather than a bullet point here — happy to
  scope either one out properly if you want to prioritize it next.

## Growth & marketing infra

- **Newsletter signup** — footer form, `Subscriber` model, admin list + CSV
  export. No sending infrastructure is included (that's a separate decision —
  Resend/Mailchimp/etc. — once you have real content to send).
- **SEO pass** — `robots.txt`, a static `sitemap.xml` covering all static pages,
  and JSON-LD structured data (`Organization` schema site-wide, `Course` schema
  where applicable) added to the shared `SEO.jsx` component.
- **Chatbot expanded site-wide** — the AI advisor widget used to only appear on
  `/workshops`; it's now a global `GlobalChatWidget` on every public page
  (hidden on dashboards/auth pages where it'd just be clutter).
- ⚠️ **Not built**: A/B testing infrastructure. This needs an analytics/
  experimentation platform decision (PostHog, GrowthBook, etc.) before there's
  anything to wire up.

## Technical / security

- **Admin 2FA on login** — admins (and any user with `twoFactorEnabled`) now
  get an emailed 6-digit code as a second login step (`/login-otp`), separate
  from the registration OTP. Regular users log in normally unless they opt in.
- **Session/device management** — refresh tokens are now tracked server-side
  (`User.activeSessions`, capped at 8 per account, rotated on every refresh).
  Both user and admin Settings pages show active sessions with device info and
  a **"Log out of all devices"** button that actually revokes every session,
  not just the current one. A password reset also now clears all sessions.
- **Found and fixed another real auth gap while in there**: `/api/team`'s
  create/update/delete endpoints had no auth check at all — anyone could add,
  edit, or delete team member profiles. Locked to admins only.

## Suggested next steps (still standing from before, plus new ones)

1. **Automated tests** — still the biggest gap. With 2FA, sessions, payments,
   and OTP all now live, the auth surface area has grown a lot since the last
   note about this — this really deserves a dedicated pass before adding more
   features on top.
2. **WCAG accessibility audit** — deferred this round; scope it as its own
   project (screen reader pass, keyboard nav, contrast audit).
3. **Data export/delete self-service** — for DPDP/GDPR completeness, alongside
   the accessibility audit.
4. **Per-account OTP rate limiting** — current rate limits are IP-based; a
   shared/corporate IP could get throttled by other people's attempts.
5. **Dynamic sitemap** — the current `sitemap.xml` is static and won't pick up
   new blog posts or case studies automatically. Worth a small backend route
   or build-time generation once content volume grows.
6. **Video hosting / LMS-style course content** — the biggest remaining item
   from the original brainstorm; needs a storage/CDN budget decision first.

---

# Round 4 — dev login shortcut, real services, real images, homepage redesign

## Easier verification for testing

- **`SKIP_EMAIL_VERIFICATION=true`** env flag (backend `.env`): register and log
  in with just email + password, no OTP codes at all — for both regular users
  and admins. **Hard-blocked when `NODE_ENV=production`** regardless of the env
  value, so it can never accidentally ship live. Off by default.
- **`npm run seed:test-user`** (in `backend/`): creates a pre-verified regular
  account — `test@jaskron.com` / `Test@1234` — so you can log in immediately
  without touching OTP at all, even with the bypass flag off. Admin still
  requires its login OTP by design (that's a real security feature, not a bug);
  use the bypass flag above if you want to skip that too during dev.

## Services — real content instead of an empty collection

The Services page had frontend fallback content, but the database (and
therefore the admin Services manager) was empty. Added:
- `image` field on the `Service` model
- **`npm run seed:services`**: seeds 8 real services (Phishing Simulation,
  Penetration Testing, Security Workshops, Incident Response Planning,
  Compliance Readiness, a Student Bootcamp, Network Security Audit, and 1:1
  Consulting), each with a real cover image, feature list, and price
- Admin Services manager now has an image URL field with a live preview, and a
  fixed bug where the icon picker used lowercase values (`shield`) that never
  matched the public page's icon map (`Shield`) — service icons were silently
  always falling back to the default. Now consistent.
- Service cards on both the homepage and `/services` show their cover image

## Real images across the site

Sourced legitimate, freely-licensed Unsplash photos (not AI-generated, not
scraped from random sites) and wired them into:
- The hero section background + service cards + homepage "Why Choose Us" grid
- **`npm run seed:content`**: seeds 2 case studies and 3 blog posts, each with
  a cover image — plus 3 testimonials — so those new sections aren't empty on
  first run. **The case study client names are intentionally fictional**
  ("Nimbus Retail Pvt Ltd", "Vantage Financial Services") — swap them for real
  clients from the admin panel once you have permission to publish their
  results. I did not fabricate real company names or logos for this, on
  purpose — that would misrepresent actual client relationships.
- Case study and blog cover images now actually render (the model field
  existed but nothing displayed it) on listing pages, detail pages, and the
  homepage teaser. Admin Blog manager got an image URL field to match.
- Partner logos remain **empty by default** — deliberately not seeded with
  placeholder "client" logos, since that would visually imply real companies
  use JASKRON when they don't. Add real ones from the admin panel once you
  have client logos you're allowed to display.

## Homepage — full redesign

Rebuilt from the ground up, drawing on patterns from modern SaaS/security
sites (Stripe/Linear/Cloudflare-style):
- **New hero**: a realistic product-dashboard mockup (security score ring,
  animated mini bar chart, live "activity feed") instead of an abstract icon,
  floating badge accents, a subtle hero background photo + animated gradient
  mesh, and a grid overlay.
- **Auto-scrolling logo marquee** (CSS-driven, pauses on hover) replacing the
  old static logo wrap — once you add partner logos, they'll animate.
- **New "Why Choose Us" bento grid**: a large image-backed feature card plus
  supporting cards, with real animated number counters (count up on scroll
  into view) instead of static numbers.
- **Services now appear on the homepage** (previously only on `/services`),
  with images.
- Case studies teaser and testimonials carousel (from earlier rounds) kept,
  now with real seeded content to show off.
- **Final CTA** now has a background photo + overlay instead of a flat color,
  plus a second "talk to us about your team" button pointing at `/enterprise`.

Everything above passed a full syntax check (`node --check` on every backend
file, `esbuild` parse on every frontend file) before packaging.

---

# Round 5 — bug fixes: services page, certificate, toggles, fake stats, email, images

## Services page was showing nothing — root cause found

Four components (`ServicesSection`, `TeamSection`, `ContactSection`,
`WorkshopSection`) all linked to background images on a third-party CloudFront
URL (`d2xsxph8kpxj0f.cloudfront.net`) that isn't under your control and appears
to be dead — left over from an earlier scaffolding tool, before this project
was handed off. That's very likely why `/services` looked empty. All four
replaced with real, working Unsplash images (same ones used elsewhere on the
site, so it stays visually consistent). All 6 workshop cards in
`WorkshopSection` were also pointing at the exact same broken URL — now each
has its own distinct image.

If `/services` still looks empty after this, run `npm run seed:services` in
`backend/` and confirm the frontend can actually reach your backend
(`VITE_API_URL` in `frontend/.env`) — the page does have a hardcoded fallback
that should show 8 services even with no backend connected, so if it's still
blank, open the browser console and check for a JS error.

## Certificate — QR code was overlapping the footer text

Found it: the QR code block and the "Verify at jaskron.com/..." + certificate
ID text were both centered at the same x-position with overlapping y-ranges —
the QR code was literally drawn on top of the text. Rewrote the whole footer
as three cleanly separated columns (date · wax-seal emblem + signature · QR
code), each in its own horizontal lane with no shared coordinate space, so
nothing can overlap regardless of content length.

While rebuilding it, also made the certificate itself more realistic:
- Wax-seal-style emblem (gold gradient circle with a checkmark) next to the
  signature — real certificates almost always have a formal seal, not just text
- Gold accent lines and a double border (gold + cyan) instead of a single thin
  line, which reads as more "official document" and less "app card"
- Switched the title/name to serif type throughout (was mixed serif/sans)
- Renamed to "Certificate of Achievement" with "This certifies that... has
  successfully completed..." — standard certificate language

## Settings toggles — the knob could render outside the pill

Found the bug: the toggle's white knob only had `top` positioning set, with no
explicit `left` — it relied on the browser's fallback "static position"
calculation for `left`, which isn't reliable across all rendering contexts.
Combined with the `translate-x-4` shift for the "on" state, this could push
the knob outside the rounded pill in some browsers/layouts. Fixed by
explicitly anchoring the knob at `left-0.5` and toggling between
`translate-x-0` / `translate-x-4` (mathematically guaranteed to stay within
the 40×24px track with a 2px margin on each side), plus added `overflow-hidden`
on the track as a second line of defense. Fixed in both the user Settings page
and Admin Settings page (they had duplicate, identically-bugged components).

## Admin overview was showing fake numbers on failure

Found it: whenever the dashboard's data fetch failed for *any* reason
(backend down, wrong `VITE_API_URL`, expired session, network blip), the
`catch` block silently substituted hardcoded numbers — `24 users, 21 active,
58 contacts, 6 workshops` — with no indication anything was wrong. That's
exactly what you saw. Replaced with a real error banner that explains what
actually failed (session expired vs. can't reach the API vs. a server error)
and a **Retry** button. When data can't load, the stat cards now show `—`
instead of confident-looking fake numbers.

## Email simplified — Gmail address + app password, no SMTP config

Replaced the SMTP host/port/secure configuration with Nodemailer's built-in
`service: 'gmail'` preset. New env vars: `EMAIL_USER` (your Gmail address) and
`EMAIL_PASS` (a Gmail **App Password** — Google Account → Security → 2-Step
Verification → App passwords; your normal Gmail login password will not work
here, Google blocks it). `EMAIL_FROM` is optional. This replaces
`SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` everywhere,
including the admin System Status panel.

## Images added across the rest of the site

Round 4 only touched the homepage. This round adds real images to every other
public page:
- **`PageHero`** (used by About, Services, Workshops, Team, Blog, Case
  Studies, Resources, Contact, Enterprise, Scorecard) now supports a
  background image — each of those 10 pages got its own distinct, on-theme
  photo instead of the plain gradient-only header.
- **About page**: the stats grid is now overlaid on a real team photo instead
  of floating on empty background.
- **Login page**: the left branding panel now has a real photo behind the
  gradient (previously grid pattern + glow only, no photo).
- **Forgot Password / Reset Password / Verify Email / Login OTP**: added a
  subtle themed background image to each (previously flat background).
- **Certificate verify page**: subtle background image added.
- **Workshops**: added an `image` field to the `Workshop` model — admin can
  set a cover photo per workshop, shown on both the public `/workshops` cards
  and the "My Workshops" dashboard view. Falls back to the existing decorative
  gradient strip when no image is set, so nothing looks broken for workshops
  without one yet.
- **404 page**: was completely off-brand (light theme, no logo, generic
  styling that didn't match the rest of the dark cyan/blue site) — rebuilt to
  match the site's actual design system, with the JASKRON logo and a
  background image.
