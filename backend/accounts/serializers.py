"""Serializers for accounts API."""
from __future__ import annotations

from django.utils import timezone
from rest_framework import serializers

from .models import SignupToken, User
from .utils import generate_username


class SignupRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=User.Roles.choices)

    def validate(self, attrs):
        email = attrs["email"]
        role = attrs["role"]
        active_tokens = SignupToken.objects.filter(
            email__iexact=email,
            role=role,
            is_used=False,
            expires_at__gte=timezone.now(),
        )
        if active_tokens.exists():
            raise serializers.ValidationError(
                "A verification email has already been sent. Please check your inbox or try again later."
            )
        return attrs

    def save(self, **kwargs):
        email = self.validated_data["email"]
        role = self.validated_data["role"]
        lifetime = kwargs.get("lifetime_minutes")
        return SignupToken.issue(email=email, role=role, lifetime_minutes=lifetime or 30)


class SignupVerifySerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    remember_me = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        token_value = attrs["token"]
        try:
            signup_token = SignupToken.objects.get(token=token_value)
        except SignupToken.DoesNotExist as exc:
            raise serializers.ValidationError({"token": "Invalid or expired token."}) from exc

        if not signup_token.is_valid():
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        attrs["signup_token"] = signup_token
        return attrs

    def save(self, **kwargs):
        signup_token: SignupToken = self.validated_data["signup_token"]
        first_name = self.validated_data.get("first_name", "")
        last_name = self.validated_data.get("last_name", "")
        password = self.validated_data.get("password")

        user_exists = User.objects.filter(
            email__iexact=signup_token.email,
            role=signup_token.role,
        ).exists()
        if user_exists:
            signup_token.mark_used()
            raise serializers.ValidationError(
                {"token": "An account already exists for this email and role. Please log in instead."}
            )

        username = generate_username(signup_token.email, signup_token.role)
        user = User(
            username=username,
            email=signup_token.email,
            role=signup_token.role,
            first_name=first_name,
            last_name=last_name,
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        signup_token.mark_used()
        return {
            "user": user,
            "remember_me": self.validated_data.get("remember_me", False),
        }


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
