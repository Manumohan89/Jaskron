# Jaskron Technologies PVT LTD

A full-stack cybersecurity training & awareness platform — public marketing site,
user dashboard, and a full admin control panel — built with **React (JSX) + Vite**
on the frontend and **Node.js / Express + MongoDB** on the backend.

This version has been fully converted from TypeScript to plain **JavaScript / JSX**
and restructured into two independently deployable apps:

```
jaskron-secure-ops/
├── frontend/   → deploy to Vercel
└── backend/    → deploy to Render
```

---

## 1. What's inside

### Frontend (`/frontend`)
- React 19 + Vite 7, plain `.jsx`/`.js` (no TypeScript)
- Tailwind CSS v4 + shadcn/ui component library (50+ pre-built components)
- `framer-motion` animations, `lucide-react` icons, `recharts` charts
- Pages:
  - `/` — public marketing site (Hero, About, Services, Workshops, Team, Contact)
  - `/login` — sign in / register
  - `/dashboard` — logged-in **user** dashboard (workshops, services, profile, certificates)
  - `/admin` — logged-in **admin** dashboard (full control panel — see below)
- Fully responsive: collapsible mobile sidebar, responsive grids, scrollable tables —
  works on phones, tablets, and desktops.

### Backend (`/backend`)
- Express REST API, MongoDB via Mongoose
- Lightweight HMAC-based auth (no external JWT package — see `middleware/auth.js`)
- Routes: `/api/auth`, `/api/users`, `/api/services`, `/api/workshops`,
  `/api/team`, `/api/contacts`, `/api/admin`
- `seedAdmin.js` — one-time script to create the first admin account

### Admin control panel (`/admin`)
The admin dashboard lets an admin:
- View live stats (users, contacts, workshops, services, certificates issued, pending service requests)
- **Workshops** — create, edit, delete workshops; view who's registered for each one; mark a
  registration as attended/completed; issue a certificate directly from a completed registration
- **Services** — create, edit, delete service offerings; see every user's "service request" inbox
  and move requests through pending → contacted → in-progress → completed/rejected
- **Certificates** — issue a new certificate to any user (pick recipient, course title, grade),
  preview the certificate, download it as PNG, or revoke it
- **Users** — change role, activate/deactivate, delete, or open a full detail view of a user
  showing their workshops, certificates, and service requests in one place
- View contact form submissions and security log placeholders

### User dashboard (`/dashboard`)
- **Workshops** — browse all workshops, register with one click, see live "registered / full /
  completed" status, cancel a registration
- **Services** — browse services, submit a request (with contact details + message) without
  leaving the page
- **Certificates** — see every certificate earned, view it full-size, download as a PNG
- **Profile** — edit name/phone/organization/bio, see live stats (workshops registered,
  certificates earned, service requests made)

### The certificate itself
Certificates render as a polished SVG (dark, ornamental border, gold/cyan accents, grade badge,
unique certificate ID) — both in the admin's issue/preview flow and the user's "My Certificates"
tab. Downloading converts the SVG to a high-resolution PNG entirely in the browser (no server
round-trip, no extra dependencies).

---

## 2. Run it locally first (recommended before deploying)

### Backend
```bash
cd backend
cp .env.example .env       # edit MONGODB_URI, JWT_SECRET, etc.
npm install
npm start                  # runs on http://localhost:5000
```

Create your first admin account:
```bash
# still inside /backend, with .env configured
ADMIN_EMAIL=admin@jaskron.com ADMIN_PASSWORD=ChangeMe123 npm run seed:admin
```

### Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000
npm install
npm run dev                # runs on http://localhost:3000
```

Open `http://localhost:3000`, register a normal account, then log in with the
admin credentials above and visit `/admin`.

---

## 3. Deploy the backend to Render

1. Push this repo to GitHub (or push just the `backend/` folder as its own repo).
2. Go to [render.com](https://render.com) → **New → Web Service** → connect your repo.
   - If your repo contains both folders, set **Root Directory** to `backend`.
3. Render will detect `render.yaml` (or set manually):
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables (Render dashboard → Environment):
   - `MONGODB_URI` — your MongoDB Atlas connection string (create a free cluster at
     [mongodb.com/atlas](https://www.mongodb.com/atlas) if you don't have one)
   - `NODE_ENV` = `production`
   - `JWT_SECRET` — a long random string
   - `CORS_ORIGIN` — your Vercel frontend URL once you have it, comma-separated if
     you need more than one, e.g. `https://your-app.vercel.app`
5. Deploy. Once live, note your backend URL, e.g.
   `https://jaskron-secure-ops-api.onrender.com`
6. Create the admin account against the live database. From the Render dashboard,
   open the **Shell** tab for your service and run:
   ```bash
   npm run seed:admin
   ```
   (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars first, or edit them directly
   in `seedAdmin.js` defaults before deploying).

> Render's free tier spins the service down when idle — the first request after
> idling can take ~30–60s to respond. Upgrade to a paid plan to avoid this for a
> production launch.

---

## 4. Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
   - If your repo contains both folders, set **Root Directory** to `frontend`.
2. Vercel will auto-detect Vite. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://jaskron-secure-ops-api.onrender.com`)
4. Deploy. Vercel gives you a URL like `https://jaskron-secure-ops.vercel.app`.
5. Go back to Render and update `CORS_ORIGIN` to that exact Vercel URL, then
   redeploy the backend (or it'll just pick up the env var change automatically).

`vercel.json` is already included with a SPA rewrite rule (`/(.*) → /index.html`)
so client-side routes like `/admin` and `/dashboard` work on refresh/direct link.

---

## 5. Connecting the dots — quick checklist

- [ ] MongoDB Atlas cluster created, connection string copied
- [ ] Backend deployed to Render with `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` set
- [ ] Admin account seeded against the production database
- [ ] Frontend deployed to Vercel with `VITE_API_URL` pointing at the Render URL
- [ ] `CORS_ORIGIN` on Render updated to the final Vercel URL
- [ ] Logged in as admin on the live site and confirmed `/admin` loads stats/users

---

## 6. Notes on the TypeScript → JavaScript conversion

- All `.ts`/`.tsx` files were converted to `.js`/`.jsx`, with type annotations,
  interfaces, and generics stripped — runtime behavior is unchanged.
- All relative backend imports now explicitly include the `.js` extension, which
  plain Node ESM requires (the original TS dev tooling didn't need this, but
  production `node` does).
- Dev-only tooling from the original scaffold (debug log collector, a custom Vite
  runtime plugin, a `wouter` patch for route introspection) was removed — none of
  it is needed in production and removing it keeps the build lean.
- The Express server no longer serves the built frontend itself (`app.use(express.static(...))`
  was removed) since the frontend is now deployed separately on Vercel.
