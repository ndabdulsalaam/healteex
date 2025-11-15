"""healteex_backend URL Configuration."""
from __future__ import annotations

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView


from .views import (
    ApiRootView,
    HealthCheckView,
    ObtainAPITokenView,
    EmailOrUsernameTokenObtainPairView,
    GoogleSignInView,
)

urlpatterns = [
    path("", ApiRootView.as_view(), name="api-root"),
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/auth/token/", ObtainAPITokenView.as_view(), name="api-token"),
    path("api/auth/jwt/create/", EmailOrUsernameTokenObtainPairView.as_view(), name="jwt-create"),
    path("api/auth/jwt/refresh/", TokenRefreshView.as_view(), name="jwt-refresh"),
    path("api/auth/jwt/verify/", TokenVerifyView.as_view(), name="jwt-verify"),
    path("api/auth/google/", GoogleSignInView.as_view(), name="google-sign-in"),
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/inventory/", include("inventory.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
