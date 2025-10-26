"""Tests for the project level API endpoints."""
from __future__ import annotations

from django.test import SimpleTestCase
from django.urls import reverse


class ApiRootViewTests(SimpleTestCase):
    """Verify the API root returns a helpful payload."""

    def test_root_returns_welcome_message(self) -> None:
        response = self.client.get(reverse("api-root"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "message": "Welcome to the Healteex API.",
                "documentation": (
                    "Refer to /api/health/ for a health check and /api/v1/ for available "
                    "endpoints."
                ),
            },
        )
