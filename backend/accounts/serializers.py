"""Serializers for accounts API."""
from __future__ import annotations

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "facility",
        ]
        read_only_fields = ["id"]
