"""Project level utility views."""
from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views import View
from django.db import transaction
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from accounts.models import User
from accounts.utils import build_jwt_response, generate_username


class HealthCheckView(View):
    """Return a simple JSON payload indicating the API is reachable."""

    def get(self, request, *args, **kwargs):  # type: ignore[override]
        return JsonResponse({"status": "ok", "message": "Healteex API is available."})


class ApiRootView(View):
    """Provide a lightweight landing response for the API root."""

    def get(self, request, *args, **kwargs):  # type: ignore[override]
        return JsonResponse(
            {
                "message": "Welcome to the Healteex API.",
                "documentation": (
                    "Refer to /api/health/ for a health check and /api/v1/ for available "
                    "endpoints."
                ),
            }
        )


class ObtainAPITokenView(ObtainAuthToken):
    """
    Issue or reuse DRF token while keeping CSRF exempt and exposing a hook
    for throttling or logging via DRF infrastructure.
    """

    authentication_classes: tuple = ()
    permission_classes = [AllowAny]

    def post(self, request: Request, *args, **kwargs) -> Response:  # type: ignore[override]
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=False)
    remember_me = serializers.BooleanField(required=False, default=False)
    role = serializers.ChoiceField(choices=User.Roles.choices, required=False)

    def validate(self, attrs):  # type: ignore[override]
        email = attrs.get("email")
        remember_me = attrs.get("remember_me", False)
        role = attrs.get("role")
        if email:
            user_model = get_user_model()
            queryset = user_model.objects.filter(email__iexact=email)
            if role:
                queryset = queryset.filter(role=role)
            try:
                user = queryset.get()
            except user_model.DoesNotExist as exc:
                raise serializers.ValidationError({"email": "No user found with this email."}) from exc
            except user_model.MultipleObjectsReturned as exc:
                raise serializers.ValidationError(
                    {
                        "role": "Multiple accounts match this email. Please specify the role you intend to use.",
                    }
                ) from exc
            attrs[self.username_field] = getattr(user, self.username_field)
        super().validate(attrs)
        return build_jwt_response(self.user, remember_me=bool(remember_me))


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    permission_classes = [AllowAny]
    authentication_classes: tuple = ()


class GoogleSignInView(APIView):
    """
    Exchange a Google OAuth2 id_token for JWT credentials.

    The client must obtain an ID token on the frontend then POST it here. When the user
    does not yet exist, an account is provisioned with an unusable password so local login
    can be enabled later if needed.
    """

    permission_classes = [AllowAny]
    authentication_classes: tuple = ()

    def post(self, request: Request, *args, **kwargs) -> Response:  # type: ignore[override]
        id_token_value = request.data.get("id_token")
        remember_me = bool(request.data.get("remember_me", False))
        requested_role = request.data.get("role")

        if not id_token_value:
            return Response({"detail": "id_token is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            return Response(
                {"detail": "Google sign-in is not configured on this environment."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            id_info = google_id_token.verify_oauth2_token(
                id_token_value, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError as exc:  # pragma: no cover - network dependent
            return Response({"detail": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

        if not id_info.get("email_verified", False):
            return Response({"detail": "Google account email is not verified."}, status=status.HTTP_400_BAD_REQUEST)

        email = id_info.get("email")
        if not email:
            return Response({"detail": "Google token missing email claim."}, status=status.HTTP_400_BAD_REQUEST)

        user_model = get_user_model()
        queryset = user_model.objects.filter(email__iexact=email)
        if requested_role:
            queryset = queryset.filter(role=requested_role)
        user = queryset.first()
        if not user and not requested_role:
            matches = list(user_model.objects.filter(email__iexact=email)[:2])
            if len(matches) == 1:
                user = matches[0]
            elif len(matches) > 1:
                return Response(
                    {"detail": "Multiple accounts exist for this email. Please specify the role."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        if not user:
            with transaction.atomic():
                role_to_assign = requested_role or User.Roles.PHARMACIST
                if role_to_assign not in dict(User.Roles.choices):
                    return Response({"detail": "Unsupported role."}, status=status.HTTP_400_BAD_REQUEST)
                username_candidate = generate_username(email, role_to_assign)
                user = user_model(
                    username=username_candidate,
                    email=email,
                    role=role_to_assign,
                    first_name=id_info.get("given_name", ""),
                    last_name=id_info.get("family_name", ""),
                )
                user.set_unusable_password()
                user.save()
        else:
            if requested_role and user.role != requested_role:
                return Response(
                    {"detail": "Google account already exists with a different role. Please use email/password login."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            updated = False
            first_name = id_info.get("given_name")
            last_name = id_info.get("family_name")
            if first_name and user.first_name != first_name:
                user.first_name = first_name
                updated = True
            if last_name and user.last_name != last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save(update_fields=["first_name", "last_name"])

        return Response(build_jwt_response(user, remember_me=remember_me), status=status.HTTP_200_OK)
