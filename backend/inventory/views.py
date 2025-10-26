"""ViewSets for inventory resources."""
from __future__ import annotations

from rest_framework import viewsets

from .models import Alert, Facility, Forecast, IntegrationConfig, InventoryTransaction, Medicine, StockSnapshot
from .serializers import (
    AlertSerializer,
    FacilitySerializer,
    ForecastSerializer,
    IntegrationConfigSerializer,
    InventoryTransactionSerializer,
    MedicineSerializer,
    StockSnapshotSerializer,
)


class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer


class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer


class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.select_related("facility", "medicine", "created_by")
    serializer_class = InventoryTransactionSerializer


class StockSnapshotViewSet(viewsets.ModelViewSet):
    queryset = StockSnapshot.objects.select_related("facility", "medicine")
    serializer_class = StockSnapshotSerializer


class ForecastViewSet(viewsets.ModelViewSet):
    queryset = Forecast.objects.select_related("facility", "medicine")
    serializer_class = ForecastSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.select_related("facility", "medicine", "resolved_by")
    serializer_class = AlertSerializer


class IntegrationConfigViewSet(viewsets.ModelViewSet):
    queryset = IntegrationConfig.objects.all()
    serializer_class = IntegrationConfigSerializer
