"""Project level utility views."""
from __future__ import annotations

from django.http import JsonResponse
from django.views import View


class HealthCheckView(View):
    """Return a simple JSON payload indicating the API is reachable."""

    def get(self, request, *args, **kwargs):  # type: ignore[override]
        return JsonResponse({"status": "ok", "message": "Healteex API is available."})
