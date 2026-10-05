# Specialist Clinic — Dr. Saleha Ibtisam

Frontend for **Specialist Clinic**, a women's health and obstetrics practice in Morgah,
Rawalpindi. Built to the client's 23-page requirements document.

> Consultant Gynecologist & Obstetrician | MBBS, FCPS
> Providing professional care for pregnancy, women's health, infertility, family planning,
> menopause, normal & C-section deliveries, and gynecological surgeries.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 + TypeScript (strict) |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 (all routes lazy-loaded) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Icons | Lucide React |
| Motion | Framer Motion |

## Getting started

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The dev server runs on <http://localhost:5173> and proxies `/api` to
`http://localhost:5000`.

## Scripts

```bash
npm run dev       # dev server
npm run build     # typecheck + production build
npm run preview   # serve the production build
npm run lint      # tsc -b
```

## Environment variables

Copy `.env.example` to `.env`. All values are client-side `VITE_*` flags.

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Backend API base | `http://localhost:5000/api` |
| `VITE_API_WITH_CREDENTIALS` | Send cookies (secure session auth) | `true` |
| `VITE_USE_MOCK_API` | Use the in-browser mock instead of a server | `true` |
| `VITE_SITE_URL` | Canonical production origin | empty |
| `VITE_GA_MEASUREMENT_ID` | GA4 property; empty keeps analytics fully off | empty |

### About mock mode

`VITE_USE_MOCK_API=true` serves all data from `src/mocks/adapter.ts` with no backend, so
the whole site and admin area can be reviewed before the API exists. Admin credentials in
mock mode:

```
admin@specialistclinic.test
ClinicDev2025!
```

These are development-only values. They are not real credentials and must never be set in
a production deployment.

## Project structure

```
frontend/src
├── admin/          Admin screens (login, dashboard, services, gallery, inquiries, settings)
├── components/
│   ├── brand/      Logo lockups and the clinic's own brand artwork
│   ├── common/     Buttons, layout, breadcrumbs, smart images
│   ├── contact/    Contact CTAs, map, appointment banner
│   ├── feedback/   Alerts, empty/loading states, error boundary
│   ├── forms/      Field primitives with accessible error wiring
│   ├── navigation/ Public header and footer
│   ├── seo/        Document head management
│   └── services/   Service icons and cards
├── config/         Environment configuration
├── constants/      Clinic contact details, hours, approved copy  ← single source of truth
├── context/        Auth, settings, toast providers
├── hooks/          Admin list state, page-view tracking
├── mocks/          Mock API adapter and seed data
├── pages/          Route components
├── routes/         Central route table
├── schemas/        Zod validation schemas
├── services/       API clients
├── types/          Shared domain and API types
└── utils/          Contact link builders, analytics, validation helpers
```

## Architecture notes

**One source of truth for clinic data.** Contact numbers, hours, address and approved
promotional copy live in `src/constants/clinic.ts` and are mirrored into the admin
`SiteSettings` screen, so the clinic can change them without a code deploy.

**Phone and WhatsApp links are always built in one place** (`src/utils/contact.ts`). No page
constructs a `tel:` or `wa.me` URL by hand, so numbers cannot drift apart.

**Map links use confirmed coordinates.** `33.54987, 73.07968` was supplied by the clinic.
`buildMapHref()` produces Google Maps directions from those coordinates and only uses
`settings.mapUrl` when the clinic provides a short link.

**Analytics stay dormant by default.** With no `VITE_GA_MEASUREMENT_ID`, no third-party
script is loaded and every tracking call is a no-op. Once configured, phone / WhatsApp /
appointment CTA clicks emit `cta_click` events containing no patient data.

**Session auth uses httpOnly cookies.** No token is ever written to `localStorage` or
`sessionStorage`. Admin routes are guarded client-side; the backend must enforce its own
authorization.

**Credentials are displayed from settings, not hard-coded.** The About page renders
whatever is in `doctorQualifications`, so adding a qualification in the admin area updates
the public site immediately.

## Before launch

Outstanding items that require confirmation from the clinic:

- [ ] Notification email for form submissions (**required** — forms cannot go live without it)
- [ ] Exact official spelling of the plaza/building name
- [ ] Whether `BSc` should be published alongside MBBS, FCPS
- [ ] Exact hospital affiliation / designation wording
- [ ] Approved doctor portrait and clinic photography
- [ ] Production domain, then update `public/sitemap.xml`
- [ ] GA4 measurement ID
- [ ] Real backend deployed; `VITE_USE_MOCK_API` set to `false`
- [ ] HTTPS enforced

## Accessibility & performance

- Semantic landmarks and headings on every page
- Visible focus rings and 44px minimum tap targets
- Lazy-loaded routes; below-the-fold images lazy-loaded
- Explicit `width`/`height` on images to avoid layout shift
- Logo derivatives at 128/256/512px so mobile does not download the 319KB original