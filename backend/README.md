# Specialist Clinic — Backend API

Node.js + Express + MongoDB (Mongoose) REST API for the Specialist Clinic
website. It powers the **Services**, **Gallery**, **Contact**, **Book
Appointment** and **Site Settings** sections shown in the admin panel, plus
everything the public website reads.

Images are stored on **Cloudinary** (not on the server's disk).

---

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Open `backend/.env` and fill in the three things below. Everything else has a
working default.

### MongoDB (required)

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/specialist-clinic
```

A free MongoDB Atlas cluster works fine. Locally you can also use
`mongodb://127.0.0.1:27017/specialist-clinic`.

The currently configured cluster uses the plain `mongodb://` shard-list form
rather than `mongodb+srv://`. Both are valid; the shard-list form is used
because Node's DNS resolver refuses SRV lookups on some networks and DNS
setups (see Troubleshooting below).

### Cloudinary (required only for gallery uploads)

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

Get these from the Cloudinary dashboard → *Product Environment Credentials*.
Gallery uploads return a clear `503` until they are set; every other feature
works without them.

### Admin login (required)

```env
JWT_SECRET=<a long random string>
ADMIN_EMAIL=admin@specialistclinic.com
ADMIN_PASSWORD=ChangeMe123!
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The first time the API starts it creates this admin account automatically
(if it does not already exist) and default clinic settings.

---

## 2. Run

```bash
npm run dev      # development, auto-restarts on change
npm run build    # compile TypeScript to dist/
npm start        # run the compiled server

npm run seed                          # create admin + settings if missing
npm run seed -- --reset-password      # also reset the admin password
```

The API listens on **http://localhost:5000/api** by default.

Health check: `GET http://localhost:5000/api/health`

---

## 3. Connecting the website

The frontend ships with a built-in mock backend. To use this real API, open
`frontend/.env` and flip one flag:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_WITH_CREDENTIALS=true
```

Then sign in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD`
from `backend/.env`.

---

## 4. API reference

All responses are JSON. Errors use `{ "message": string, "errors"?: { field: message } }`.
Authentication uses a JWT stored in an **HttpOnly cookie** (`sc_session`), so
browsers send it automatically and JavaScript can never read it.

### Public

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Service status |
| GET | `/api/services` | Published services (`?search=`) |
| GET | `/api/services/featured` | Featured services (`?limit=`) |
| GET | `/api/services/:slug` | One published service |
| GET | `/api/gallery` | Published images (`?category=&limit=`) |
| GET | `/api/settings/public` | Clinic details (private fields removed) |
| POST | `/api/contact` | Submit a contact inquiry |
| POST | `/api/appointments` | Submit an appointment request |

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ identifier, password }` → sets session cookie |
| POST | `/api/auth/logout` | Clears the session cookie |
| GET | `/api/auth/me` | Current signed-in user |

### Admin (session required)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Counts + 5 most recent records |
| GET | `/api/admin/services` | Paginated list (`?page&limit&search&status`) |
| POST | `/api/admin/services` | Create a service |
| POST | `/api/admin/services/reorder` | `{ ids: [...] }` |
| GET | `/api/admin/services/:id` | One service |
| PUT / PATCH | `/api/admin/services/:id` | Update a service |
| DELETE | `/api/admin/services/:id` | Delete a service |
| POST | `/api/admin/uploads/image` | Upload one image, returns its URL (multipart field `image`; optional `folder`) |
| GET | `/api/admin/gallery` | Paginated list (`?page&limit&search&status&category`) |
| POST | `/api/admin/gallery` | Create image (multipart, field `image`) |
| GET | `/api/admin/gallery/:id` | One gallery item |
| PATCH | `/api/admin/gallery/:id` | Update (multipart or JSON) |
| DELETE | `/api/admin/gallery/:id` | Delete item + Cloudinary asset |
| GET | `/api/admin/inquiries` | Paginated (`?page&limit&search&status`) |
| GET | `/api/admin/inquiries/:id` | One inquiry |
| PATCH / PUT | `/api/admin/inquiries/:id` | Update status / internal notes |
| GET | `/api/admin/appointments` | Paginated (`?page&limit&search&status`) |
| GET | `/api/admin/appointments/:id` | One appointment request |
| PATCH / PUT | `/api/admin/appointments/:id` | Confirm / update status |
| GET | `/api/admin/settings` | Full settings |
| PUT / PATCH | `/api/admin/settings` | Update settings |

---

## 5. Project structure

```
backend/src/
  index.ts              server entry point
  app.ts                express app (middleware + route wiring)
  seed.ts               CLI seeding script
  config/               env, mongodb, cloudinary
  models/               Service, GalleryItem, ContactInquiry,
                        AppointmentRequest, AdminUser, SiteSettings
  middleware/           auth (session cookie), error handler, multer upload
  routes/               public, forms, auth + routes/admin/*
  services/bootstrap.ts creates the admin account + settings on first boot
  validation/schemas.ts zod schemas for every request body
  utils/                ApiError, pagination, phone/email rules, helpers
```

## 6. Troubleshooting

**`querySrv ECONNREFUSED _mongodb._tcp.<cluster>.mongodb.net`**

Your DNS server is refusing SRV lookups (Node's driver uses them only for
`mongodb+srv://` URIs). Two fixes:

1. Use a normal connection string listing the hosts directly, e.g.

   ```
   mongodb://<user>:<pass>@shard-00-00.xxxx.mongodb.net:27017,shard-00-01.xxxx.mongodb.net:27017,shard-00-02.xxxx.mongodb.net:27017/dbname?ssl=true&authSource=admin
   ```

2. Get the hostnames from Atlas → *Connect* → *Drivers*, or from a terminal:
   `nslookup -type=SRV _mongodb._tcp.<cluster>.mongodb.net`

**Gallery uploads return 503**

`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are
not set (or are wrong) in `backend/.env`.

**Requests from the website are blocked by CORS**

Add the website's origin (scheme + host + port, no trailing slash) to
`CORS_ORIGINS` in `backend/.env`, comma-separated.

**Admin login returns 401 with the right password**

Reset it: `npm run seed -- --reset-password`

---

## 7. Notes

- **Nothing is auto-confirmed.** An appointment submission is a *request* with
  status `new`; clinic staff confirm it from the admin panel.
- **Honeypot + rate limiting** protect the two public forms from spam.
- **Images** are uploaded to Cloudinary and deleted from Cloudinary when the
  gallery item is removed. The server never writes uploads to disk.
- **Service photos** are uploaded from the admin Service form through
  `POST /api/admin/uploads/image`, which returns a URL that is saved on the
  service. Leave it empty and the card falls back to the branded icon tile.
- **Input validation** (phone/email formats, lengths, enums) mirrors the
  frontend rules, so the API cannot be bypassed by calling it directly.
