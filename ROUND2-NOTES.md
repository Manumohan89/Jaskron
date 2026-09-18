# JASKRON Technologies Pvt. Ltd. — Round 2 Notes

Everything from `REBUILD-NOTES.md` still applies. This covers the second set of changes:
paid internships, batches with live/recorded classes, admin-approved assessments,
certificates for both courses and internships, institutional bookings, gallery,
careers, and the DPIIT/MSME badges.

---

## 1. Paid internships

Internships are now fee-based programmes with their own model, catalog, and application flow.

**New models:** `Internship`, `InternshipApplication`
**New pages:** `/internships` (catalog), `/internships/:slug` (detail + apply)
**Admin tab:** Internships → *Programmes* and *Applications*

Each internship carries a fee and an optional discounted fee, a duration, a track
(short-term / long-term / project-based / research), a mode, seats per batch, what the
student gets, a programme outline, deliverables, and eligibility.

### Application lifecycle

```
applied → shortlisted → payment_pending → enrolled
                                        ↘ rejected / withdrawn
```

The applicant fills in college, branch, year, phone, resume link, and motivation.
Admin moves the status, marks payment `paid` / `waived`, and assigns a batch — assigning a
batch with status `enrolled` automatically adds the student to that batch's roster.
The student sees their status and next step under **Dashboard → My Internships**.

### The fee is for training, not for the certificate

This is stated on the internships page, in the application modal, and enforced in code:
a certificate cannot be issued without a recorded performance score. Payment unlocks class
access; the certificate is earned.

## 2. Batches — live classes, recordings, approval, certificates

**New model:** `Batch` (with embedded `sessions[]` and `members[]`)
**Admin tab:** Batches & Classes
**Student tab:** Live & Recorded

A batch belongs to either a course or an internship and holds:

- **Sessions** — each with a title, scheduled time, duration, a live meeting URL, a recording
  URL, and notes. Status cycles `scheduled → live → recorded`. Setting a session to *Live*
  notifies every paid member.
- **Members** — payment status, attendance %, performance score, mentor remarks, and an
  `assessmentApproved` flag.
- A standing live-class link, a schedule note, capacity, mentor, and an optional linked assessment.

### Access gating

Live links, recordings, and notes are stripped server-side for members whose payment isn't
confirmed — the frontend never receives the URLs, so hiding them isn't just a UI concern.
The student sees a clear "payment pending" notice instead.

### Assessment approval

Students cannot reach the assessment until an admin ticks `assessmentApproved` for them —
individually, or with **Approve all paid for assessment**. Only then does the exam code
appear in their Assessment Centre. Approval fires a notification.

### Certificate issuing

Admin records a performance score (0–100) per member, then issues:

- **Per student** — the Issue button on the roster row
- **Whole batch** — *Issue certificates*, which covers everyone scored and not yet certified

Grade bands: **85+ Distinction · 70–84 Merit · below 70 Pass**. The certificate stores the
programme type, the batch, the performance score, attendance, mentor remarks, and the
duration — and the student gets a notification.

Certificates are also still auto-issued on 100% course completion in the self-paced LMS.

## 3. Assessment Centre — moved behind login, renamed

The public `/exam` page is gone from the navigation. Assessments now live at
**Dashboard → Assessment Centre**, which shows:

- Assessments released to your batches, with the code revealed only once you're approved
  (locked ones show "Awaiting admin approval")
- A manual code field, for codes handed out directly
- Your full result history

The `/exam/take/:code` and `/exam/result/:id` routes still exist — they're what the
Assessment Centre links into.

## 4. Institutions — book a resource person

**New model:** `ResourcePersonBooking`
**New page:** `/institutions`
**Admin tab:** Resource Bookings

Colleges and companies pick a programme type (workshop, bootcamp, guest lecture, faculty
development, seminar, hackathon support), select the skills they want covered from a
tag list, and submit dates, duration, mode, participant count, and department. No login
needed — it's a public form.

Admin tracks each request through `new → contacted → proposal_sent → confirmed → delivered`,
assigns a named resource person, sets a scheduled date, and keeps internal notes.

This is also where campus workshops for college students are organised from.

## 5. Gallery

**New model:** `GalleryItem`
**New page:** `/gallery`
**Admin tab:** Gallery

A masonry grid with category tabs (Batches, Workshops, Campus Programs, Company, Events,
Team) and a keyboard-navigable lightbox. Category tabs only appear for categories that
actually have photos.

Admin adds photos by URL with a title, caption, category, institution, date taken, sort
order, and featured/published toggles. Featured and visibility can be toggled straight
from the grid.

## 6. Careers

**New models:** `JobOpening`, `JobApplication`
**New page:** `/careers`
**Admin tab:** Careers → *Openings* and *Applications*

Public page lists open roles as expandable cards with responsibilities, requirements, and
nice-to-haves, plus an inline application form (name, email, phone, resume, portfolio,
cover note). With no openings published it shows an open-application prompt instead of an
empty page.

Admin creates roles (draft / open / closed) and moves candidates through
`new → reviewing → interview → offered → hired / rejected` with internal notes.

## 7. DPIIT & MSME recognition

`CERTIFICATIONS` in `config/company.js` drives a new `TrustBadges` component:

- **Full variant** — a three-card strip used on the homepage, internships, careers, and institutions pages
- **Compact variant** — a single inline row in the footer

Edit the labels and descriptions in `config/company.js`. If your DPIIT or Udyam
registration numbers should appear publicly, add them to the `body` text there.

## 8. Homepage restructure

The LMS dashboard mockup has moved off the hero into its own `LmsPreview` section further
down the page, as requested. The new order:

1. Hero — now leads with the paid-internship proposition and a programme card
2. Trust badges (DPIIT / MSME)
3. Featured paid internships
4. Why JASKRON (vision, mission, values)
5. Service catalog
6. Featured courses
7. **LMS dashboard preview** (the relocated mockup)
8. Partner logos
9. Testimonials
10. Explore grid — now including Gallery and Careers
11. Final CTA

Both the internships and courses bands render nothing until content is published, so the
homepage never shows an empty section.

## 9. Navigation

**Public:** Home · Courses · Internships · Services · Institutions · Gallery · Careers · About · Contact
(Projects, Research, Team, Blog, Resources are in the mobile menu and footer.)

**After login:** an Assessments button appears in the header.

**Student dashboard tabs:** Overview · My Learning · Live & Recorded · Assessment Centre ·
My Internships · Workshops · Services · Profile · Certificates · Resources · Notifications · Settings

**Admin tabs:** Overview · Users · Contacts · Courses (LMS) · Internships · Batches & Classes ·
Assessments · Gallery · Careers · Resource Bookings · Workshops · Services · Certificates ·
Resources · Blog · Testimonials · Team · Partners · Case Studies · Newsletter · Enterprise ·
Security · Settings

## 10. Seeding

```bash
cd backend
npm run seed:admin        # admin account
npm run seed:courses      # 4 courses + sample exam (code MERN01)
npm run seed:programs     # 3 paid internships + a batch each, 6 gallery photos, 1 job opening
```

Seeded internship fees: ₹5,999 (full-stack, 8 weeks), ₹4,499 (data analytics, 6 weeks),
₹12,999 (AI/ML research, 12 weeks). Change them in the admin panel or `seedPrograms.js`.

## 11. New API surface

```
GET    /api/internships                        published catalog
GET    /api/internships/:idOrSlug              detail + your application + upcoming batches
POST   /api/internships/:id/apply              student applies
GET    /api/internships/me/applications        student's applications
GET    /api/internships/admin/all              admin
POST   /PUT /DELETE /api/internships[/:id]     admin CRUD
GET    /api/internships/applications/all       admin
PATCH  /api/internships/applications/:id       admin — status, payment, batch assignment

GET    /api/batches/me                         student — classes, recordings, assessment access
GET    /api/batches                            admin
POST   /GET /PUT /DELETE /api/batches[/:id]    admin CRUD
POST   /api/batches/:id/members                add a student
PATCH  /api/batches/:id/members/:memberId      payment, attendance, score, approval
DELETE /api/batches/:id/members/:memberId      remove
POST   /api/batches/:id/approve-all            approve all paid members for assessment
POST   /api/batches/:id/members/:mid/certificate   issue one certificate
POST   /api/batches/:id/certificates           bulk issue
POST   /PATCH /DELETE /api/batches/:id/sessions[/:sid]   live-class schedule

GET    /api/gallery                            public
GET    /POST /PUT /DELETE /api/gallery         admin

GET    /api/careers                            public — open roles
GET    /api/careers/:slug                      public
POST   /api/careers/:id/apply                  public
GET    /POST /PUT /DELETE /api/careers         admin
GET    /api/careers/applications/all           admin
PATCH  /api/careers/applications/:id           admin

POST   /api/bookings                           public — institutional booking
GET    /PATCH /DELETE /api/bookings[/:id]      admin
```

## 12. Still outstanding

- **Payment gateway.** Fees are tracked but not collected online — admin marks payment
  `paid` manually. The Razorpay code in `routes/payments.js` is still wired to workshops
  and needs extending to internships and courses. Until then, collect payment out of band.
- **Image uploads.** Gallery and thumbnails take URLs, not file uploads. `middleware/upload.js`
  exists and could back a real uploader.
- **Attendance** is entered by hand. If you want it derived from live-class joins, that
  needs a join-tracking endpoint.
- **Certificate PDF** still uses the existing `CertificateTemplate`. It doesn't yet render
  the new fields (performance score, attendance, duration, mentor remarks) — worth updating
  if you want those printed.
- **Bundle size** is now ~1.1 MB. Route-level code splitting is overdue.
- Unsplash placeholder images and the placeholder stats in `config/company.js` still need
  replacing with your own.
