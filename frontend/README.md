# Healteex Frontend

React + Vite application for multi-role onboarding, authentication (email/password, Google OAuth), and inventory insights powered by the Django backend.

## Prerequisites
- Node.js 18+
- npm 9+

## Installation
```bash
cd frontend
npm install
```

## Environment
Create `.env.local` with:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
# Optional – required for Google sign-in
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```
`VITE_API_BASE_URL` defaults to `/api`, which works when the frontend is served by the Django dev server proxy. Configure `VITE_GOOGLE_CLIENT_ID` with a client ID from Google Cloud (Web application type) to render the one-tap/standard Google sign-in button.

## Development
```bash
npm run dev
```
Visit <http://127.0.0.1:5173>. Use the signup flow to register per-role accounts or sign in with existing credentials.

## Production Build
```bash
npm run build
```
Outputs static assets in `frontend/dist`. These files can be served via any static host or collected into Django's static pipeline.
