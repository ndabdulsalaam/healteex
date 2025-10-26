"""API views for account management."""
from __future__ import annotations

from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser

from .models import User
from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related("facility")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
