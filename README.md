# PixelShare

**Module:** Scalable Advanced Software Solutions
**Type:** Full-stack coursework submission

---

## Purpose

PixelShare answers a straightforward question: *how do you build a photo and video sharing platform that can actually grow?*

The project demonstrates cloud-native development principles through a working product. Two user personas — creators who produce content and consumers who engage with it — drive the feature set. Every architectural decision maps back to a specific scalability concern.

---

## Who Uses It

### Creators
A creator account unlocks:
- Uploading photos and videos with rich metadata (title, caption, location, people present)
- A private dashboard listing all their own uploads
- The ability to delete any of their own posts

### Consumers
A consumer account unlocks:
- Browsing a paginated feed of all published content
- Running text searches across titles, captions, locations, and people
- Viewing individual posts with full detail
- Giving star ratings (1–5 stars; one per post per person, updates on re-submission)
- Posting comments
- Bookmarking posts to a personal saved list
- Following and unfollowing creators

---

## The Technology

| Layer | Choice | Notes |
|-------|--------|-------|
| UI framework | React 18 | Component model, hooks, fast reconciliation |
| Build tool | Vite | Near-instant HMR, optimised production bundles |
| CSS | Tailwind CSS | Utility classes, no runtime overhead |
| Routing | React Router v6 | Client-side navigation, nested route support |
| HTTP | Axios | Interceptors make JWT attachment automatic |
| API | Express.js + Node.js | Minimal, fast, easy to deploy |
| Database | PostgreSQL | Relational, ACID, wide hosting support |
| ORM | Prisma | Type-safe queries, first-class migration tooling |
| Auth | JWT + bcryptjs | Stateless tokens, secure password storage |
| Uploads | Multer | Multipart middleware for Express |
| Tests | Jest + Supertest | Full HTTP integration tests |

---

## System Design

```
                  ┌─────────────────────────────┐
                  │    React 18 (Vite SPA)       │
                  │  Runs in the browser          │
                  │  Static files: HTML/CSS/JS    │
                  └───────────────┬─────────────┘
                                  │
                    REST over HTTP (JSON + multipart)
                                  │
                  ┌───────────────▼─────────────┐
                  │    Express.js REST API       │
                  │                             │
                  │  ┌──────────────────────┐   │
                  │  │ JWT auth middleware   │   │
                  │  │ Role-check guards     │   │
                  │  │ LRU cache (60s TTL)   │   │
                  │  │ Multer upload handler │   │
                  │  └──────────────────────┘   │
                  └──────────┬──────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
   ┌──────────▼──────────┐    ┌─────────────▼──────────┐
   │    PostgreSQL        │    │    uploads/ directory   │
   │    via Prisma ORM    │    │    (media files)        │
   └─────────────────────┘    └────────────────────────┘
```

The frontend, API, and data layer are independently deployable. No part of the system is aware of the others' internal implementation.

---

## Scalability Decisions and Why

**Decision 1: Stateless JWT auth**
The server issues a signed token at login. Every subsequent request includes that token in the Authorization header. The server verifies the signature — no database lookup, no session table, no sticky sessions. Any number of API instances can handle any request. Scale out horizontally without coordination.

**Decision 2: Filesystem-separated media storage**
Binary files go to `backend/uploads/`. The database stores only the URL string. Consequence: the database stays small and query-friendly. When needed, replace Multer's disk storage adapter with an OpenStack Swift or S3 adapter. The schema doesn't change.

**Decision 3: Response caching**
The feed list and search results are expensive reads under concurrent load. Both are wrapped in a 60-second TTL cache. Cache entries are keyed by query parameters and invalidated when new content is published. For a multi-process deployment, Redis replaces the in-process store.

**Decision 4: SPA frontend**
`npm run build` produces static files. They go on a CDN or a static host. No Node.js process needed to serve the UI in production. Latency is determined by CDN proximity, not server load.

**Decision 5: Prisma with managed PostgreSQL**
Migrations are code. The same migration files run locally, on CI, and on a Neon or Supabase free-tier instance. No manual SQL, no schema drift.

---

## Data Model

```
┌──────────────────────────────────────────────────┐
│ users                                            │
│   id · name · email(unique) · passwordHash       │
│   role(creator|consumer) · createdAt · updatedAt │
└───────────────────────────┬──────────────────────┘
                            │ creatorId
              ┌─────────────▼──────────────────────┐
              │ images                              │
              │   id · title · caption · location   │
              │   peoplePresent · imageUrl          │
              │   storageKey · timestamps           │
              └──────┬──────────────────┬───────────┘
                     │                  │
           ┌─────────▼────────┐  ┌──────▼────────────┐
           │ comments          │  │ ratings            │
           │  id · commentText │  │  id · ratingValue  │
           │  userId · imageId │  │  UNIQUE(img, user) │
           └──────────────────┘  └───────────────────┘
                     │
           ┌─────────▼────────┐  ┌──────────────────┐
           │ bookmarks         │  │ follows           │
           │  userId · imageId │  │  followerId       │
           └──────────────────┘  │  followingId      │
                                  └──────────────────┘
```

---

## API Surface

```
# Authentication
POST  /api/auth/register          Create a consumer account
POST  /api/auth/login             Get a JWT
GET   /api/auth/me                [JWT] Who am I?

# Content
POST    /api/images               [JWT:creator]  Publish media
GET     /api/images               Public feed — paginated, cached
GET     /api/images/search?q=     Full-text search — cached
GET     /api/images/mine          [JWT:creator]  My uploads
GET     /api/images/:id           Single post
DELETE  /api/images/:id           [JWT:creator]  Delete my post

# Engagement
POST  /api/images/:id/comments    [JWT:consumer]  Comment
POST  /api/images/:id/ratings     [JWT:consumer]  Rate (upsert)
POST  /api/images/:id/likes       [JWT:consumer]  Toggle like
POST  /api/images/:id/bookmarks   [JWT:consumer]  Toggle bookmark
POST  /api/users/:id/follow       [JWT:consumer]  Toggle follow
```

---

## Running the Project

**Prerequisites:** Node.js 18+, PostgreSQL 14+

**1. Configure the backend**

```bash
cd backend
cp .env.example .env
# Set DATABASE_URL in .env, e.g.:
# DATABASE_URL=postgresql://postgres:secret@localhost:5432/pixelshare
```

**2. Start the API**

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
# http://localhost:5000
```

**3. Start the frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# http://localhost:5173
```

---

## Test Suite

```bash
cd backend
npm test
```

Tests are written with Jest and Supertest. They hit a real database (set `DATABASE_URL` in `.env.test`).

**Coverage:**

| Test | Verifies |
|------|----------|
| Consumer registration | 201, token in response |
| Creator login | 200, valid JWT |
| Creator upload | 201, record in DB |
| Consumer tries to upload | 403 |
| Unauthenticated upload | 401 |
| Comment submission | 201, comment persisted |
| Rating submission | 200, rating stored or updated |
| Search | 200, results match query |

---

## Deployment

**1. Set production environment variables**
```
DATABASE_URL=postgresql://user:pass@host:5432/pixelshare
JWT_SECRET=long-random-unpredictable-string
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

**2. Run the API**
```bash
cd backend
npm install && npx prisma generate && npx prisma migrate deploy
node prisma/seed.js && node server.js
```

**3. Build the frontend**
```bash
cd frontend
npm install && npm run build
# Serve dist/ via Nginx, Netlify, or Vercel
```

**4. Nginx config**
```nginx
server {
    listen 80;

    location /api     { proxy_pass http://localhost:5000; }
    location /uploads { proxy_pass http://localhost:5000; }
    location /        {
        root /var/www/pixelshare/frontend/dist;
        try_files $uri /index.html;
    }
}
```

**Zero-cost hosting options**

| Service | Purpose |
|---------|---------|
| Neon / Supabase | PostgreSQL database |
| Railway / Render | Node.js API |
| Vercel / Netlify | React static frontend |

---

## Seed Credentials

```
creator@example.com   |  password123  |  Creator
consumer@example.com  |  password123  |  Consumer
```

---

## Honest Limitations

**In-memory cache** — one process only. Restart clears all cached responses. Redis is the right fix for anything beyond a single instance.

**Local file storage** — `uploads/` is ephemeral in containerised environments. Object storage (OpenStack Swift, Cloudflare R2) is the production solution.

**No media processing** — files are stored and served at their original size and format. A Sharp pipeline would add compression and thumbnail generation.

**No moderation tooling** — inappropriate content would require admin tooling or third-party content scanning.

---

## References

- Express.js: https://expressjs.com
- Prisma: https://www.prisma.io/docs
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- JSON Web Tokens: https://jwt.io
- Multer: https://github.com/expressjs/multer
- Jest: https://jestjs.io
- Supertest: https://github.com/ladjs/supertest
