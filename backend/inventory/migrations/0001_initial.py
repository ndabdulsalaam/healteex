from __future__ import annotations

from django.conf import settings
from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Facility",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("code", models.CharField(max_length=50, unique=True)),
                (
                    "facility_type",
                    models.CharField(
                        choices=[
                            ("hospital", "Hospital"),
                            ("clinic", "Clinic"),
                            ("pharmacy", "Pharmacy"),
                            ("health_post", "Health Post"),
                            ("warehouse", "Warehouse"),
                        ],
                        max_length=32,
                    ),
                ),
                (
                    "ownership",
                    models.CharField(
                        choices=[
                            ("public", "Public"),
                            ("private", "Private"),
                            ("faith_based", "Faith Based"),
                            ("ngo", "NGO"),
                        ],
                        max_length=32,
                    ),
                ),
                ("address", models.CharField(blank=True, max_length=255)),
                ("city", models.CharField(blank=True, max_length=128)),
                ("state", models.CharField(max_length=128)),
                (
                    "lga",
                    models.CharField(
                        blank=True, max_length=128, verbose_name="Local Government Area"
                    ),
                ),
                (
                    "latitude",
                    models.DecimalField(
                        blank=True, decimal_places=6, max_digits=9, null=True
                    ),
                ),
                (
                    "longitude",
                    models.DecimalField(
                        blank=True, decimal_places=6, max_digits=9, null=True
                    ),
                ),
                ("contact_email", models.EmailField(blank=True, max_length=254)),
                ("contact_phone", models.CharField(blank=True, max_length=32)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
                "verbose_name_plural": "Facilities",
            },
        ),
        migrations.CreateModel(
            name="Medicine",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("generic_name", models.CharField(max_length=255)),
                ("category", models.CharField(blank=True, max_length=128)),
                ("atc_code", models.CharField(blank=True, max_length=32)),
                ("pack_size", models.CharField(blank=True, max_length=64)),
                ("unit", models.CharField(default="unit", max_length=32)),
                ("description", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["name"],
                "unique_together": {("name", "pack_size", "unit")},
            },
        ),
        migrations.CreateModel(
            name="IntegrationConfig",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("system_name", models.CharField(max_length=128, unique=True)),
                ("base_url", models.URLField()),
                (
                    "auth_type",
                    models.CharField(
                        choices=[
                            ("basic", "Basic Auth"),
                            ("token", "Token"),
                            ("oauth2", "OAuth2"),
                            ("none", "No Auth"),
                        ],
                        default="none",
                        max_length=16,
                    ),
                ),
                ("credentials", models.JSONField(blank=True, default=dict)),
                ("is_active", models.BooleanField(default=True)),
                ("last_sync_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "ordering": ["system_name"],
                "verbose_name": "Integration Configuration",
                "verbose_name_plural": "Integration Configurations",
            },
        ),
        migrations.CreateModel(
            name="InventoryTransaction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "transaction_type",
                    models.CharField(
                        choices=[
                            ("receipt", "Receipt"),
                            ("issue", "Issue"),
                            ("adjustment", "Adjustment"),
                            ("stock_count", "Stock Count"),
                        ],
                        max_length=16,
                    ),
                ),
                (
                    "quantity",
                    models.DecimalField(
                        decimal_places=2,
                        max_digits=12,
                        validators=[django.core.validators.MinValueValidator(0)],
                    ),
                ),
                ("batch_number", models.CharField(blank=True, max_length=64)),
                ("expiry_date", models.DateField(blank=True, null=True)),
                ("source_destination", models.CharField(blank=True, max_length=255)),
                ("reference", models.CharField(blank=True, max_length=255)),
                ("notes", models.TextField(blank=True)),
                (
                    "occurred_at",
                    models.DateTimeField(
                        help_text="When the transaction occurred at the facility level."
                    ),
                ),
                ("recorded_at", models.DateTimeField(auto_now_add=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="created_transactions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "facility",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="transactions",
                        to="inventory.facility",
                    ),
                ),
                (
                    "medicine",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="transactions",
                        to="inventory.medicine",
                    ),
                ),
            ],
            options={
                "ordering": ["-occurred_at"],
            },
        ),
        migrations.CreateModel(
            name="StockSnapshot",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("stock_on_hand", models.DecimalField(decimal_places=2, max_digits=12)),
                ("days_of_stock", models.PositiveIntegerField(default=0)),
                ("data_source", models.CharField(default="manual", max_length=64)),
                ("recorded_at", models.DateTimeField()),
                (
                    "facility",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="stock_snapshots",
                        to="inventory.facility",
                    ),
                ),
                (
                    "medicine",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="stock_snapshots",
                        to="inventory.medicine",
                    ),
                ),
            ],
            options={
                "ordering": ["-recorded_at"],
                "unique_together": {(
                    "facility",
                    "medicine",
                    "recorded_at",
                )},
            },
        ),
        migrations.CreateModel(
            name="Forecast",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("forecast_date", models.DateField()),
                ("period_start", models.DateField()),
                ("period_end", models.DateField()),
                ("predicted_demand", models.DecimalField(decimal_places=2, max_digits=12)),
                (
                    "confidence_interval_lower",
                    models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
                ),
                (
                    "confidence_interval_upper",
                    models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
                ),
                ("model_version", models.CharField(max_length=64)),
                (
                    "facility",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="forecasts",
                        to="inventory.facility",
                    ),
                ),
                (
                    "medicine",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="forecasts",
                        to="inventory.medicine",
                    ),
                ),
            ],
            options={
                "ordering": ["-forecast_date"],
                "unique_together": {(
                    "facility",
                    "medicine",
                    "forecast_date",
                    "period_start",
                    "period_end",
                    "model_version",
                )},
            },
        ),
        migrations.CreateModel(
            name="Alert",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "alert_type",
                    models.CharField(
                        choices=[
                            ("stock_out", "Stock Out"),
                            ("low_stock", "Low Stock"),
                            ("expiry", "Expiry Risk"),
                            ("forecast_variance", "Forecast Variance"),
                        ],
                        max_length=32,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("open", "Open"),
                            ("acknowledged", "Acknowledged"),
                            ("resolved", "Resolved"),
                        ],
                        default="open",
                        max_length=16,
                    ),
                ),
                ("message", models.TextField()),
                ("triggered_at", models.DateTimeField()),
                ("resolved_at", models.DateTimeField(blank=True, null=True)),
                (
                    "facility",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="alerts",
                        to="inventory.facility",
                    ),
                ),
                (
                    "medicine",
                    models.ForeignKey(
                        on_delete=models.CASCADE,
                        related_name="alerts",
                        to="inventory.medicine",
                    ),
                ),
                (
                    "resolved_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=models.SET_NULL,
                        related_name="resolved_alerts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-triggered_at"],
            },
        ),
        migrations.AddIndex(
            model_name="inventorytransaction",
            index=models.Index(
                fields=["facility", "medicine", "occurred_at"],
                name="inventory_facility_medicine_idx",
            ),
        ),
    ]
