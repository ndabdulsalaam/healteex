"""Management command for loading demo data into the Healteex backend."""
from __future__ import annotations

import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from inventory.models import Alert, Facility, Forecast, IntegrationConfig, InventoryTransaction, Medicine, StockSnapshot
from rest_framework.authtoken.models import Token


DEFAULT_PASSWORD = "ChangeMe123!"
random.seed(42)


class Command(BaseCommand):
    help = "Seeds the database with deterministic demo data so the API and frontend can be exercised."

    def handle(self, *args, **options):  # noqa: ARG002 - required by Django
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding Healteex demo data"))
        with transaction.atomic():
            facilities = self._seed_facilities()
            medicines = self._seed_medicines()
            users = self._seed_users(facilities)
            self._seed_transactions(facilities, medicines, users)
            self._seed_stock_snapshots(facilities, medicines)
            self._seed_forecasts(facilities, medicines)
            self._seed_alerts(facilities, medicines, users)
            self._seed_integrations()

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created. Login with any seeded username and password "
                f"'{DEFAULT_PASSWORD}' or use their generated API tokens."
            )
        )

    # --- Seed helpers -------------------------------------------------
    def _seed_facilities(self) -> dict[str, Facility]:
        payloads = [
            {
                "code": "LAG-GEN",
                "name": "Lagos Central Hospital",
                "facility_type": Facility.FacilityType.HOSPITAL,
                "ownership": Facility.Ownership.PUBLIC,
                "address": "12 Marina Road",
                "city": "Lagos",
                "state": "Lagos",
                "lga": "Lagos Island",
                "contact_email": "info@laggen.gov.ng",
                "contact_phone": "+234700000001",
            },
            {
                "code": "ABJ-CLN",
                "name": "Abuja Community Clinic",
                "facility_type": Facility.FacilityType.CLINIC,
                "ownership": Facility.Ownership.PUBLIC,
                "address": "Plot 4, Central Business District",
                "city": "Abuja",
                "state": "FCT",
                "lga": "AMAC",
                "contact_email": "hello@abjclinic.ng",
                "contact_phone": "+234700000002",
            },
            {
                "code": "KAN-WHS",
                "name": "Kano Regional Warehouse",
                "facility_type": Facility.FacilityType.WAREHOUSE,
                "ownership": Facility.Ownership.PUBLIC,
                "address": "Old Airport Road",
                "city": "Kano",
                "state": "Kano",
                "lga": "Tarauni",
                "contact_email": "warehouse@kano.ng",
                "contact_phone": "+234700000003",
            },
            {
                "code": "ENU-PHM",
                "name": "Enugu Sunrise Pharmacy",
                "facility_type": Facility.FacilityType.PHARMACY,
                "ownership": Facility.Ownership.PRIVATE,
                "address": "2 Zik Avenue",
                "city": "Enugu",
                "state": "Enugu",
                "lga": "Enugu South",
                "contact_email": "support@sunrisepharm.ng",
                "contact_phone": "+234700000004",
            },
        ]

        facilities: dict[str, Facility] = {}
        for payload in payloads:
            facility, _ = Facility.objects.update_or_create(code=payload["code"], defaults=payload)
            facilities[facility.code] = facility
        self.stdout.write(self.style.SUCCESS(f"Facilities: {len(facilities)} records"))
        return facilities

    def _seed_medicines(self) -> dict[str, Medicine]:
        payloads = [
            {
                "name": "Artemisinin-based Combination Therapy",
                "generic_name": "Artemether/Lumefantrine",
                "category": "Antimalarial",
                "pack_size": "24 tablet pack",
                "unit": "pack",
            },
            {
                "name": "Oxytocin Injection",
                "generic_name": "Oxytocin",
                "category": "Maternal Health",
                "pack_size": "10 IU vial",
                "unit": "vial",
            },
            {
                "name": "Zinc Sulfate",
                "generic_name": "Zinc",
                "category": "Child Health",
                "pack_size": "10 tablet strip",
                "unit": "strip",
            },
            {
                "name": "ORS Sachet",
                "generic_name": "Oral Rehydration Salts",
                "category": "Child Health",
                "pack_size": "20.5 g sachet",
                "unit": "sachet",
            },
            {
                "name": "Insulin",
                "generic_name": "Human Insulin",
                "category": "NCD",
                "pack_size": "10 ml vial",
                "unit": "vial",
            },
        ]

        medicines: dict[str, Medicine] = {}
        for payload in payloads:
            medicine, _ = Medicine.objects.update_or_create(name=payload["name"], defaults=payload)
            medicines[medicine.name] = medicine
        self.stdout.write(self.style.SUCCESS(f"Medicines: {len(medicines)} records"))
        return medicines

    def _seed_users(self, facilities: dict[str, Facility]) -> dict[str, User]:
        payloads = [
            {
                "username": "superadmin",
                "first_name": "Sade",
                "last_name": "Bakare",
                "role": User.Roles.SUPER_ADMIN,
                "is_superuser": True,
                "is_staff": True,
            },
            {
                "username": "policy",
                "first_name": "David",
                "last_name": "Okoro",
                "role": User.Roles.POLICY_MAKER,
                "facility": facilities["ABJ-CLN"],
            },
            {
                "username": "lagos-admin",
                "first_name": "Ada",
                "last_name": "Olawale",
                "role": User.Roles.FACILITY_ADMIN,
                "facility": facilities["LAG-GEN"],
                "is_staff": True,
            },
            {
                "username": "enugu-pharm",
                "first_name": "Chinonso",
                "last_name": "Eke",
                "role": User.Roles.PHARMACIST,
                "facility": facilities["ENU-PHM"],
            },
        ]

        users: dict[str, User] = {}
        for payload in payloads:
            username = payload.pop("username")
            facility = payload.pop("facility", None)
            user, _ = User.objects.get_or_create(username=username)
            for key, value in payload.items():
                setattr(user, key, value)
            user.facility = facility
            if not user.email:
                user.email = f"{username}@demo.healteex.ng"
            user.set_password(DEFAULT_PASSWORD)
            user.save()
            Token.objects.get_or_create(user=user)
            users[username] = user
        self.stdout.write(self.style.SUCCESS(f"Users: {len(users)} records (password: {DEFAULT_PASSWORD})"))
        return users

    def _seed_transactions(self, facilities: dict[str, Facility], medicines: dict[str, Medicine], users: dict[str, User]) -> None:
        now = timezone.now()
        payloads = [
            {
                "facility": facilities["LAG-GEN"],
                "medicine": medicines["Artemisinin-based Combination Therapy"],
                "transaction_type": InventoryTransaction.TransactionType.RECEIPT,
                "quantity": Decimal("450"),
                "batch_number": "ACT-2024-04",
                "source_destination": "Central Medical Store",
                "occurred_at": now - timedelta(days=7),
                "created_by": users["lagos-admin"],
            },
            {
                "facility": facilities["LAG-GEN"],
                "medicine": medicines["Oxytocin Injection"],
                "transaction_type": InventoryTransaction.TransactionType.ISSUE,
                "quantity": Decimal("120"),
                "source_destination": "Labour Ward",
                "occurred_at": now - timedelta(days=3),
                "created_by": users["lagos-admin"],
            },
            {
                "facility": facilities["ABJ-CLN"],
                "medicine": medicines["Zinc Sulfate"],
                "transaction_type": InventoryTransaction.TransactionType.RECEIPT,
                "quantity": Decimal("300"),
                "source_destination": "UNICEF Grant",
                "occurred_at": now - timedelta(days=12),
                "created_by": users["policy"],
            },
            {
                "facility": facilities["ENU-PHM"],
                "medicine": medicines["Insulin"],
                "transaction_type": InventoryTransaction.TransactionType.ADJUSTMENT,
                "quantity": Decimal("15"),
                "notes": "Adjustment after cold-chain incident",
                "occurred_at": now - timedelta(days=2),
                "created_by": users["enugu-pharm"],
            },
        ]

        for payload in payloads:
            defaults = payload.copy()
            defaults.pop("facility")
            defaults.pop("medicine")
            InventoryTransaction.objects.update_or_create(
                facility=payload["facility"],
                medicine=payload["medicine"],
                transaction_type=payload["transaction_type"],
                occurred_at=payload["occurred_at"],
                defaults=defaults,
            )
        self.stdout.write(self.style.SUCCESS("Transactions: sample records created"))

    def _seed_stock_snapshots(self, facilities: dict[str, Facility], medicines: dict[str, Medicine]) -> None:
        now = timezone.now()
        for f_index, facility in enumerate(facilities.values()):
            for m_index, medicine in enumerate(medicines.values()):
                recorded_at = now - timedelta(days=1 + f_index + m_index)
                defaults = {
                    "stock_on_hand": Decimal(120 + ((f_index + m_index) * 37) % 250),
                    "days_of_stock": 5 + ((f_index + m_index) * 3) % 35,
                    "recorded_at": recorded_at,
                }
                StockSnapshot.objects.update_or_create(
                    facility=facility,
                    medicine=medicine,
                    recorded_at=recorded_at,
                    defaults=defaults,
                )
        self.stdout.write(self.style.SUCCESS("Stock snapshots generated"))

    def _seed_forecasts(self, facilities: dict[str, Facility], medicines: dict[str, Medicine]) -> None:
        base_date = timezone.now().date()
        for facility in facilities.values():
            for medicine in list(medicines.values())[:3]:
                defaults = {
                    "period_start": base_date,
                    "period_end": base_date + timedelta(days=30),
                    "predicted_demand": Decimal(random.randint(200, 800)),
                    "confidence_interval_lower": Decimal(random.randint(150, 300)),
                    "confidence_interval_upper": Decimal(random.randint(900, 1200)),
                    "model_version": "v1.0",
                }
                Forecast.objects.update_or_create(
                    facility=facility,
                    medicine=medicine,
                    forecast_date=base_date,
                    period_start=defaults["period_start"],
                    period_end=defaults["period_end"],
                    model_version=defaults["model_version"],
                    defaults=defaults,
                )
        self.stdout.write(self.style.SUCCESS("Forecasts generated"))

    def _seed_alerts(
        self,
        facilities: dict[str, Facility],
        medicines: dict[str, Medicine],
        users: dict[str, User],
    ) -> None:
        now = timezone.now()
        payloads = [
            {
                "facility": facilities["LAG-GEN"],
                "medicine": medicines["Oxytocin Injection"],
                "alert_type": Alert.AlertType.LOW_STOCK,
                "status": Alert.Status.OPEN,
                "message": "Only 3 days of stock remaining",
                "triggered_at": now - timedelta(days=1),
            },
            {
                "facility": facilities["ENU-PHM"],
                "medicine": medicines["Insulin"],
                "alert_type": Alert.AlertType.EXPIRY,
                "status": Alert.Status.ACKNOWLEDGED,
                "message": "Batch INS-203 expires in 15 days",
                "triggered_at": now - timedelta(days=5),
                "resolved_by": users["enugu-pharm"],
                "resolved_at": now - timedelta(days=2),
            },
        ]

        for payload in payloads:
            defaults = payload.copy()
            defaults.pop("facility")
            defaults.pop("medicine")
            Alert.objects.update_or_create(
                facility=payload["facility"],
                medicine=payload["medicine"],
                alert_type=payload["alert_type"],
                triggered_at=payload["triggered_at"],
                defaults=defaults,
            )
        self.stdout.write(self.style.SUCCESS("Alerts created"))

    def _seed_integrations(self) -> None:
        payloads = [
            {
                "system_name": "DHIS2 Sandbox",
                "base_url": "https://dhis2-demo.server/api",
                "auth_type": IntegrationConfig.AuthType.BASIC,
                "credentials": {"username": "demo", "password": "District1"},
            },
            {
                "system_name": "OpenLMIS",
                "base_url": "https://openlmis.example/graphql",
                "auth_type": IntegrationConfig.AuthType.TOKEN,
                "credentials": {"token": "sample-token"},
            },
        ]

        for payload in payloads:
            IntegrationConfig.objects.update_or_create(system_name=payload["system_name"], defaults=payload)
        self.stdout.write(self.style.SUCCESS("Integration configs synced"))
