"""Admin registrations for inventory models."""
from __future__ import annotations

from django.contrib import admin

from .models import Alert, Facility, Forecast, IntegrationConfig, InventoryTransaction, Medicine, StockSnapshot

admin.site.register(Facility)
admin.site.register(Medicine)
admin.site.register(InventoryTransaction)
admin.site.register(StockSnapshot)
admin.site.register(Forecast)
admin.site.register(Alert)
admin.site.register(IntegrationConfig)
