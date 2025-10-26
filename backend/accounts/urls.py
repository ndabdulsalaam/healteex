"""URL routes for accounts app."""
from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
