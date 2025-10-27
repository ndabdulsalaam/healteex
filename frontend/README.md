# Healteex Frontend

React + Vite dashboard that authenticates against the Django API, displays live inventory metrics, and lets you create facilities or post inventory transactions.

## Prerequisites
- Node.js 18+
- npm 9+

## Installation
```bash
cd frontend
npm install
```

## Environment
The client reads `VITE_API_BASE_URL` (defaults to `/api`). When running `npm run dev`, Vite proxies `/api/*` to `http://127.0.0.1:8000`, so you normally do not need to configure anything. For production builds behind Django, continue serving the compiled assets from the same domain so `/api` resolves correctly.

## Development
```bash
npm run dev
```
Visit <http://127.0.0.1:5173>. Sign in with any seeded backend user (e.g. `superadmin` / `ChangeMe123!`).

## Production Build
```bash
npm run build
```
Outputs static assets in `frontend/dist`. These files can be served via any static host or collected into Django's static pipeline.
