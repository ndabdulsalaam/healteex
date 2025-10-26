# Agent Instructions

## Scope
These guidelines apply to the entire repository unless a nested `AGENTS.md` overrides them.

## General Workflow
- Keep commit messages descriptive and follow the conventional format `<type>: <summary>` whenever possible.
- Update or add tests when you modify application logic.
- Prefer documenting non-obvious implementation details inline with comments rather than in commit messages.

## Python / Django Backend
- Format Python code with `black` (88 character line length) and organize imports with `isort` using the "black" profile.
- Use Django REST Framework serializers and viewsets where practical; favor class-based views over function-based ones.
- Maintain database migrations in sync with model changes using Django's migration system.

## TypeScript / React Frontend
- Use functional components with hooks; avoid class components.
- Type all props and external data structures explicitly—no use of `any` unless absolutely required and documented with a comment.
- Keep styles colocated using CSS modules or Tailwind (when introduced); avoid global CSS additions unless necessary.

## Documentation
- Ensure README sections remain consistent with implemented features when you make significant changes.
- Keep environment variable documentation (`.env.example`) up to date if configuration changes.

