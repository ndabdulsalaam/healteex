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
