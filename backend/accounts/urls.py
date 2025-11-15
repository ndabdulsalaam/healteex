"""URL routes for accounts app."""
from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SignupRequestView, SignupVerifyView, UserViewSet

app_name = "accounts"

router = DefaultRouter()
router.register(r"users", UserViewSet)

urlpatterns = [
    path("signup/request/", SignupRequestView.as_view(), name="signup-request"),
    path("signup/verify/", SignupVerifyView.as_view(), name="signup-verify"),
    path("", include(router.urls)),
]
