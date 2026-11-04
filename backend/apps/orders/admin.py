from django.contrib import admin, messages
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action, display

from core.exceptions import DomainError

from .models import Cart, CartItem, Order, OrderItem
from .services import cancel_order


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product", "product_name", "unit_price", "quantity", "line_total"]
    can_delete = False


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ["number", "user", "status_badge", "total", "paid_at", "created_at"]

    @display(
        description="Status",
        ordering="status",
        label={"pending": "warning", "paid": "success", "fulfilled": "info", "cancelled": "danger"},
    )
    def status_badge(self, obj):
        return obj.status, obj.get_status_display()

    list_filter = ["status", "created_at"]
    search_fields = ["number", "user__email", "shipping_name"]
    readonly_fields = [
        "number",
        "user",
        "subtotal",
        "total",
        "paid_at",
        "payment_reference",
        "created_at",
    ]
    inlines = [OrderItemInline]
    actions = ["mark_fulfilled", "cancel_orders"]

    @action(description="Mark selected paid orders as fulfilled")
    def mark_fulfilled(self, request, queryset):
        updated = queryset.filter(status=Order.Status.PAID).update(status=Order.Status.FULFILLED)
        messages.success(request, f"{updated} order(s) fulfilled.")

    @action(description="Cancel selected orders and restock")
    def cancel_orders(self, request, queryset):
        for order in queryset:
            try:
                cancel_order(order, user=request.user)
                messages.success(request, f"{order.number} cancelled and restocked.")
            except DomainError as exc:
                messages.error(request, f"{order.number}: {exc.detail}")


class CartItemInline(TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(ModelAdmin):
    list_display = ["user", "updated_at"]
    inlines = [CartItemInline]
