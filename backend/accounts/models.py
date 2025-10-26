"""Account related database models."""
from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models


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
