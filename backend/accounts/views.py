"""API views for account management."""
from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SignupToken, User
from .serializers import SignupRequestSerializer, SignupVerifySerializer, UserSerializer
from .utils import build_jwt_response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related("facility")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class SignupRequestView(APIView):
    """Initiate the signup flow by sending a verification token to email."""

    permission_classes = [AllowAny]
    authentication_classes: tuple = ()

    def post(self, request: Request, *args, **kwargs) -> Response:  # type: ignore[override]
        serializer = SignupRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token: SignupToken = serializer.save(
            lifetime_minutes=settings.SIGNUP_TOKEN_LIFETIME_MINUTES,
        )
        verification_link = (
            f"{settings.FRONTEND_BASE_URL.rstrip('/')}/#/signup/verify?token={token.token}&role={token.role}"
        )

        message = (
            "Welcome to Healteex!\n\n"
            "Use the token below to complete your registration:\n"
            f"{token.token}\n\n"
            "Or click the link: "
            f"{verification_link}\n\n"
            f"This token expires in {settings.SIGNUP_TOKEN_LIFETIME_MINUTES} minutes."
        )

        send_mail(
            subject="Healteex signup confirmation",
            message=message,
            from_email=None,
            recipient_list=[token.email],
            fail_silently=True,
        )

        return Response(
            {
                "detail": "Verification token sent. Please check your email.",
                "expires_in_minutes": settings.SIGNUP_TOKEN_LIFETIME_MINUTES,
            },
            status=status.HTTP_202_ACCEPTED,
        )


class SignupVerifyView(APIView):
    """Complete signup by validating the token and creating a user account."""

    permission_classes = [AllowAny]
    authentication_classes: tuple = ()

    def post(self, request: Request, *args, **kwargs) -> Response:  # type: ignore[override]
        serializer = SignupVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()
        token_payload = build_jwt_response(result["user"], remember_me=result["remember_me"])
        return Response(token_payload, status=status.HTTP_201_CREATED)
