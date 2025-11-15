"""Utility helpers for accounts app."""
from __future__ import annotations

from typing import Dict

from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model


def build_jwt_response(user, remember_me: bool = False) -> Dict[str, object]:
    """
    Construct a JWT payload (access + refresh) for a user.

    When remember_me is True we extend the refresh lifetime to the configured
    REMEMBER_ME_REFRESH_LIFETIME if present.
    """

    refresh = RefreshToken.for_user(user)
    if remember_me:
        lifetime = settings.SIMPLE_JWT.get("REMEMBER_ME_REFRESH_LIFETIME")
        if lifetime:
            refresh.set_exp(lifetime=lifetime)

    access = refresh.access_token
    return {
        "refresh": str(refresh),
        "access": str(access),
        "token_type": "Bearer",
        "expires_in": int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        "remember_me": bool(remember_me),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": getattr(user, "role", None),
            "first_name": user.first_name,
            "last_name": user.last_name,
        },
    }


def generate_username(email: str, role: str) -> str:
    """
    Generate a unique username based on email + role.

    Ensures uniqueness by appending an incrementing suffix when necessary.
    """

    user_model = get_user_model()
    local_part = (email.split("@")[0] or "user").lower()
    role_slug = role.replace("_", "-")
    base_username = f"{local_part}-{role_slug}"
    candidate = base_username
    counter = 1
    while user_model.objects.filter(username=candidate).exists():
        counter += 1
        candidate = f"{base_username}-{counter}"
    return candidate
