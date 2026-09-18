# JASKRON Technologies Pvt. Ltd. — Rebuild Notes

This documents the conversion of the old cybersecurity site into the
**JASKRON Technologies Private Limited** company website, plus the new LMS.

---

## 1. Branding

- Company name changed everywhere to **JASKRON Technologies Pvt. Ltd.** (legal name
  `JASKRON Technologies Private Limited` in the footer, SEO schema, and copyright).
- Your attached logo was processed into proper web assets, all in `frontend/public/`:
  - `logo-mark.png` — hexagon shield mark, transparent background (used in the nav, footer, exam header)
  - `logo-full.png` — full lockup with wordmark
  - `favicon.png` / `favicon.ico` / `pwa-192x192.png` / `pwa-512x512.png` / `og-image.png`
- `components/Logo.jsx` now renders the real asset. Pass `variant="full"` for the full lockup.
- Colour system moved from cyan/blue to the logo palette: orange `#F2721F` / `#EA580C`
  over navy `#0B1220` / `#16233D`. Applied to Tailwind classes, CSS custom properties,
  gradients, `btn-neon`, `gradient-text`, and the PWA theme colour.
- Default theme switched from dark to light (still user-switchable).

## 2. Content source of truth

**`frontend/src/config/company.js`** holds all company content in one place:
company details, vision, mission, values, the four pillars, the eight catalog services
(with their exact sub-items from your Service Catalog), learning domains, and headline stats.

Edit that one file and it propagates to the nav, services grid, service detail pages,
about section, footer, and homepage.

## 3. Services — now matching the catalog

The old eight cybersecurity services were replaced with your actual catalog:

| # | Service | Page |
|---|---------|------|
| 01 | Skill Development | `/services/skill-development` |
| 02 | Internship Programs | `/services/internship-programs` + full page at `/internships` |
| 03 | Project Development | `/services/project-development` + full page at `/projects` |
| 04 | Workshops & Bootcamps | `/services/workshops-bootcamps` |
| 05 | Industry Guest Sessions | `/services/industry-guest-sessions` |
| 06 | E-Learning & Online Courses | `/services/e-learning` → the LMS |
| 07 | Research & Innovation | `/services/research-innovation` + full page at `/research` |
| 08 | Corporate & Institutional Training | `/services/corporate-training` |

Each detail page has its own intro copy, "what's included" list, and a "how it works" process.

## 4. The LMS (new)

### Backend

New models in `backend/models/`:

- **`Course.js`** — modules → lessons. Lesson types: `video` (recorded session),
  `document`, `text`, `lab`. Supports free-preview lessons, pricing, featured flag,
  ratings, and auto-certificate on completion.
- **`Enrollment.js`** — per-learner progress, completed lessons, last position, rating/review.
- **`Exam.js`** — questions, unique **exam code**, duration, pass mark, attempt limits,
  access rules, availability window, shuffle settings.
- **`ExamAttempt.js`** — answers, grading, timing, and a tab-switch counter for integrity.

New controllers and routes:

```
GET    /api/courses                      catalog (published only for non-admins)
GET    /api/courses/:idOrSlug            detail — locks lesson bodies unless enrolled
POST   /api/courses/:id/enroll
GET    /api/courses/me/enrollments
POST   /api/courses/:id/progress         mark a lesson complete; issues certificate at 100%
POST   /api/courses/:id/review
GET    /api/courses/admin/all            admin
POST   /api/courses                      admin
PUT    /api/courses/:id                  admin
DELETE /api/courses/:id                  admin
GET    /api/courses/:id/enrollments      admin — roster

POST   /api/exams/lookup                 validate an exam code
POST   /api/exams/start                  begin (or resume) an attempt
POST   /api/exams/attempt/:id/submit     grade and store
GET    /api/exams/attempt/:id            result + optional answer review
GET    /api/exams/me/attempts            student history
GET    /api/exams/admin/all              admin
GET    /api/exams/admin/:id              admin — full exam with answer key
POST   /api/exams                        admin
PUT    /api/exams/:id                    admin
POST   /api/exams/:id/regenerate-code    admin
DELETE /api/exams/:id                    admin
GET    /api/exams/:id/results            admin — results table + stats
```

Answer keys are never sent to students — `Exam.toStudentJSON()` strips `isCorrect`
and `acceptedAnswers` before the questions leave the server.

### Frontend — learner flow

| Route | What it does |
|-------|--------------|
| `/courses` | Catalog with search and domain/level filters |
| `/courses/:slug` | Syllabus, instructor, pricing, enroll |
| `/learn/:slug` | Player — video, notes, labs, progress sidebar, mark-complete |
| `/exam` | Enter exam code → see details → start |
| `/exam/take/:code` | Timed attempt: palette, flagging, auto-submit, tab-switch logging |
| `/exam/result/:attemptId` | Score, pass/fail, optional answer review |

Learner dashboard gained a **My Learning** tab showing enrolled courses with progress
bars and full exam history.

### Frontend — admin

Two new tabs in `/admin`:

- **Courses (LMS)** — curriculum builder. Add modules and lessons, paste a YouTube/Vimeo/MP4
  URL for each recorded session, set durations, flag free previews, attach resources,
  publish/draft, and view the enrolled roster per course.
- **Exams** — question builder supporting single-choice, multiple-correct, true/false, and
  short-answer, with marks, negative marks, and explanations. Generates the exam code,
  lets you regenerate it, and shows a results table with pass/fail counts, averages,
  and per-student tab-switch counts.

### How an exam runs

1. Admin creates the exam, adds questions, sets status to **Published**.
2. The system generates a 6-character code (e.g. `MERN01`) — copy it from the exams table.
3. Share the code with students.
4. Students sign in, go to `/exam`, enter the code, review the details, and start.
5. The timer runs server-side (`expiresAt` on the attempt), so closing the tab doesn't
   pause it. Answers auto-submit when time runs out.
6. Grading is immediate; results appear in the admin results table.

## 5. Workshops

Per your request, the workshop-centric public surface was removed: the `/workshops` page,
the nav entry, the homepage workshop section, and `WorkshopSection.jsx` are gone. The LMS
took its place.

The **backend workshop module and the admin Workshops tab were kept** because
"Workshops & Bootcamps" is service 04 in your catalog, and because certificates, check-in,
and payments reference it. If you'd rather remove it completely, say so and I'll strip the
model, routes, controller, and admin panel, and migrate certificates off the workshop link.

## 6. Pages that were empty or thin — now filled

- `/internships` — four internship tracks, domains, and a five-step process
- `/projects` — five offerings plus starting-point project ideas by domain
- `/research` — six research stages plus an academic-integrity statement
- `/services/:slug` — eight new detail pages
- `/courses`, `/exam`, and the LMS pages above
- About, Team, Contact, Enterprise, Blog, Resources — cybersecurity copy replaced

## 7. Seeding

```bash
cd backend
npm run seed:courses
```

Creates four published courses (MERN full-stack, Power BI analytics, AI/ML foundations,
cybersecurity essentials) and one sample exam with code **`MERN01`**. Safe to re-run.

## 8. Running it

```bash
# backend
cd backend
npm install
cp .env.example .env     # set MONGODB_URI and JWT_SECRET
npm run seed:admin
npm run seed:courses
npm run dev

# frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

> The `--legacy-peer-deps` flag is needed because `react-helmet-async@2.0.5` declares peer
> support only up to React 18 while the project is on React 19. This is pre-existing, not
> something introduced here. It works fine at runtime, but consider swapping to
> `@vueuse/head`-style alternatives or `react-helmet-async` v3 when available.

## 9. Known items left for you

- **Images** are hot-linked from Unsplash. Replace with your own photography before launch —
  they're all in `config/company.js` and the page files, easy to swap.
- **Stats** in `config/company.js` (5,000+ learners, 120+ programs, etc.) are placeholders.
  Put your real numbers there.
- **Video hosting**: lessons accept any URL. For paid content, consider a signed-URL provider
  rather than public YouTube links — anyone with the URL can currently view a lesson video.
- **Payments**: paid courses create an enrollment with `paymentStatus: 'pending'`. The
  existing Razorpay flow in `routes/payments.js` is still wired to workshops and would need
  extending to courses.
- The frontend bundle is ~969 KB. Route-level code splitting would help if that matters.
