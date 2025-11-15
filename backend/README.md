# Healteex Backend

This directory contains the Django project that powers the Healteex platform.

## Prerequisites
- Python 3.12 or newer
- `pip` for installing dependencies
- (Optional) `virtualenv` or `pyenv` for managing Python environments

## Initial Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Database Migrations
Before starting the development server or running tests, make sure the database schema is up to date:
```bash
python manage.py migrate
```
This command applies Django's built-in migrations as well as the project apps (`accounts`, `inventory`).

## Running the Development Server
After applying migrations, you can start the local server with:
```bash
python manage.py runserver
```

The server will be available at <http://127.0.0.1:8000/>.

## Creating a Superuser
To access the Django admin interface, create an administrative account:
```bash
python manage.py createsuperuser
```

Then visit <http://127.0.0.1:8000/admin/> and log in with the credentials you just created.

## Demo Data & API Tokens
To explore the APIs without manually creating data, load the deterministic demo dataset:

```bash
python manage.py seed_demo_data
```

This command provisions facilities, medicines, inventory transactions, alerts, and user accounts. Every seeded user shares the password `ChangeMe123!`, and an API token is minted for each account via `rest_framework.authtoken`.

### Authentication
- **JWT (recommended):** `POST /api/auth/jwt/create/` with `{"email": "superadmin@demo.healteex.ng", "password": "ChangeMe123!", "remember_me": true}` to receive `access` and `refresh` tokens. Omit `remember_me` (default) for a 1-day refresh; set it to `true` for a 30-day refresh window.
- Refresh tokens with `POST /api/auth/jwt/refresh/` and verify with `POST /api/auth/jwt/verify/`. Use the access token in requests: `Authorization: Bearer <access>`.
- **Google sign-in:** Once `GOOGLE_OAUTH_CLIENT_ID` is configured, exchange a Google ID token by POSTing to `/api/auth/google/` with `{"id_token": "<google-id-token>", "remember_me": true}`. A user is auto-provisioned (unusable password) if they do not already exist.
- **Legacy tokens:** `POST /api/auth/token/` still issues a DRF Token (`Authorization: Token <token>`) for backward compatibility, but new clients should migrate to JWT.

### Multi-role Signup Flow
- Request access via `POST /api/v1/accounts/signup/request/` with `{"email": "user@example.com", "role": "pharmacist"}`. The API issues a time-limited token (default 30 minutes) and emails it to the user.
- Complete registration with `POST /api/v1/accounts/signup/verify/` including the token, optional `password`, `first_name`, `last_name`, and `remember_me`. The response returns JWT credentials so the client can onboard immediately. Email links default to `/#/signup/verify?...` to align with the frontend hash router.
- The same email can register for multiple roles by repeating the flow with different `role` values (`pharmacist`, `policy_maker`, `facility_admin`, `super_admin`). The frontend should route users to role-specific profile setup pages after verification.

### CORS
Cross-origin requests from the Vite dev server are allowed for `http://127.0.0.1:5173` and `http://localhost:5173`. Update `CORS_ALLOWED_ORIGINS` in `settings.py` (and `.env`) when deploying to a different host.
