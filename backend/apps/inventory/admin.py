from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import StockMovement


@admin.register(StockMovement)
class StockMovementAdmin(ModelAdmin):
    list_display = [
        "created_at",
        "product",
        "quantity_delta",
        "reason",
        "reference",
        "stock_after",
        "created_by",
    ]
    list_filter = ["reason", "created_at"]
    search_fields = ["product__name", "reference"]
    readonly_fields = [f.name for f in StockMovement._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
