"""Inventory and supply chain domain models."""
from __future__ import annotations

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model that tracks creation and update timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Facility(TimeStampedModel):
    """Represents a health facility participating in the supply chain."""

    class FacilityType(models.TextChoices):
        HOSPITAL = "hospital", "Hospital"
        CLINIC = "clinic", "Clinic"
        PHARMACY = "pharmacy", "Pharmacy"
        HEALTH_POST = "health_post", "Health Post"
        WAREHOUSE = "warehouse", "Warehouse"

    class Ownership(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"
        FAITH_BASED = "faith_based", "Faith Based"
        NGO = "ngo", "NGO"

    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    facility_type = models.CharField(max_length=32, choices=FacilityType.choices)
    ownership = models.CharField(max_length=32, choices=Ownership.choices)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=128, blank=True)
    state = models.CharField(max_length=128)
    lga = models.CharField("Local Government Area", max_length=128, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Facilities"
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.name} ({self.code})"


class Medicine(TimeStampedModel):
    """Catalog of medicines tracked by the platform."""

    name = models.CharField(max_length=255)
    generic_name = models.CharField(max_length=255)
    category = models.CharField(max_length=128, blank=True)
    atc_code = models.CharField(max_length=32, blank=True)
    pack_size = models.CharField(max_length=64, blank=True)
    unit = models.CharField(max_length=32, default="unit")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("name", "pack_size", "unit")
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return self.name


class InventoryTransaction(TimeStampedModel):
    """Transaction log for medicine inventory movements."""

    class TransactionType(models.TextChoices):
        RECEIPT = "receipt", "Receipt"
        ISSUE = "issue", "Issue"
        ADJUSTMENT = "adjustment", "Adjustment"
        STOCK_COUNT = "stock_count", "Stock Count"

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name="transactions")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=16, choices=TransactionType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    batch_number = models.CharField(max_length=64, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    source_destination = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    occurred_at = models.DateTimeField(help_text="When the transaction occurred at the facility level.")
    recorded_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_transactions",
    )

    class Meta:
        ordering = ["-occurred_at"]
        indexes = [
            models.Index(fields=["facility", "medicine", "occurred_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.transaction_type} - {self.medicine} at {self.facility}"


class StockSnapshot(TimeStampedModel):
    """Point-in-time record of stock on hand."""

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name="stock_snapshots")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="stock_snapshots")
    stock_on_hand = models.DecimalField(max_digits=12, decimal_places=2)
    days_of_stock = models.PositiveIntegerField(default=0)
    data_source = models.CharField(max_length=64, default="manual")
    recorded_at = models.DateTimeField()

    class Meta:
        unique_together = ("facility", "medicine", "recorded_at")
        ordering = ["-recorded_at"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.facility} - {self.medicine} ({self.recorded_at:%Y-%m-%d})"


class Forecast(TimeStampedModel):
    """Demand forecast outputs for planning."""

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name="forecasts")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="forecasts")
    forecast_date = models.DateField()
    period_start = models.DateField()
    period_end = models.DateField()
    predicted_demand = models.DecimalField(max_digits=12, decimal_places=2)
    confidence_interval_lower = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    confidence_interval_upper = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    model_version = models.CharField(max_length=64)

    class Meta:
        unique_together = ("facility", "medicine", "forecast_date", "period_start", "period_end", "model_version")
        ordering = ["-forecast_date"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"Forecast for {self.medicine} at {self.facility}"


class Alert(TimeStampedModel):
    """Alerts generated from stock thresholds or forecasts."""

    class AlertType(models.TextChoices):
        STOCK_OUT = "stock_out", "Stock Out"
        LOW_STOCK = "low_stock", "Low Stock"
        EXPIRY = "expiry", "Expiry Risk"
        FORECAST_VARIANCE = "forecast_variance", "Forecast Variance"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        ACKNOWLEDGED = "acknowledged", "Acknowledged"
        RESOLVED = "resolved", "Resolved"

    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name="alerts")
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name="alerts")
    alert_type = models.CharField(max_length=32, choices=AlertType.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    message = models.TextField()
    triggered_at = models.DateTimeField()
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_alerts",
    )

    class Meta:
        ordering = ["-triggered_at"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return f"{self.alert_type} - {self.medicine} at {self.facility}"


class IntegrationConfig(TimeStampedModel):
    """Configuration metadata for third-party integrations."""

    class AuthType(models.TextChoices):
        BASIC = "basic", "Basic Auth"
        TOKEN = "token", "Token"
        OAUTH2 = "oauth2", "OAuth2"
        NONE = "none", "No Auth"

    system_name = models.CharField(max_length=128, unique=True)
    base_url = models.URLField()
    auth_type = models.CharField(max_length=16, choices=AuthType.choices, default=AuthType.NONE)
    credentials = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Integration Configuration"
        verbose_name_plural = "Integration Configurations"
        ordering = ["system_name"]

    def __str__(self) -> str:  # pragma: no cover - trivial representation
        return self.system_name
