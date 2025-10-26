"""URL routing for inventory APIs."""
from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AlertViewSet,
    FacilityViewSet,
    ForecastViewSet,
    IntegrationConfigViewSet,
    InventoryTransactionViewSet,
    MedicineViewSet,
    StockSnapshotViewSet,
)

router = DefaultRouter()
router.register(r"facilities", FacilityViewSet)
router.register(r"medicines", MedicineViewSet)
router.register(r"transactions", InventoryTransactionViewSet)
router.register(r"stock-snapshots", StockSnapshotViewSet)
router.register(r"forecasts", ForecastViewSet)
router.register(r"alerts", AlertViewSet)
router.register(r"integrations", IntegrationConfigViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
