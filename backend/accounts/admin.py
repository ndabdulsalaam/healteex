"""Admin configuration for account models."""
from __future__ import annotations

from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "facility")
    list_filter = ("role", "facility")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)
