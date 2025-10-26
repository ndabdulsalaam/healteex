"""Serializers for inventory domain objects."""
from __future__ import annotations

from rest_framework import serializers

from .models import Alert, Facility, Forecast, IntegrationConfig, InventoryTransaction, Medicine, StockSnapshot


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = "__all__"


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = "__all__"


class InventoryTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryTransaction
        fields = "__all__"


class StockSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockSnapshot
        fields = "__all__"


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = "__all__"


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = "__all__"


class IntegrationConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationConfig
        fields = "__all__"
