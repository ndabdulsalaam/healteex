"""healteex_backend URL Configuration."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path

from .views import ApiRootView, HealthCheckView

urlpatterns = [
    path("", ApiRootView.as_view(), name="api-root"),
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/inventory/", include("inventory.urls")),
]
