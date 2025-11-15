"""Account related database models."""
from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.crypto import get_random_string


class User(AbstractUser):
    """Custom user model supporting role-based access and facility mapping."""

    class Roles(models.TextChoices):
        PHARMACIST = "pharmacist", "Pharmacist"
        POLICY_MAKER = "policy_maker", "Policy Maker"
        FACILITY_ADMIN = "facility_admin", "Facility Administrator"
        SUPER_ADMIN = "super_admin", "Super Administrator"

    role = models.CharField(
        max_length=32,
        choices=Roles.choices,
        default=Roles.PHARMACIST,
        help_text="Primary role for access control.",
    )
    facility = models.ForeignKey(
        "inventory.Facility",
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
        help_text="Facility associated with the user, if applicable.",
    )

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.get_full_name()} ({self.username})"


class SignupToken(models.Model):
    """Stores short-lived signup tokens used to confirm email/role onboarding."""

    email = models.EmailField()
    role = models.CharField(max_length=32, choices=User.Roles.choices)
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=["email", "role"]),
            models.Index(fields=["token"]),
        ]
        ordering = ["-created_at"]

    def mark_used(self) -> None:
        self.is_used = True
        self.save(update_fields=["is_used"])

    @classmethod
    def issue(cls, email: str, role: str, lifetime_minutes: int = 30) -> "SignupToken":
        """Create a new signed token with a short lifetime."""

        token = get_random_string(length=48)
        expires_at = timezone.now() + timedelta(minutes=lifetime_minutes)
        return cls.objects.create(email=email, role=role, token=token, expires_at=expires_at)

    def is_valid(self) -> bool:
        return not self.is_used and self.expires_at >= timezone.now()
