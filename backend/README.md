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

### Token-Based Authentication
- Retrieve a token by POSTing to `POST /api/auth/token/` with `{"username": "superadmin", "password": "ChangeMe123!"}`.
- Use the token in subsequent requests: `Authorization: Token <token>`.
- The React frontend (see `../frontend`) uses the same endpoint to authenticate.
