from django import forms
from django.contrib import admin, messages
from django.shortcuts import redirect, render
from django.urls import path
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action, display

from apps.inventory.models import StockMovement
from apps.inventory.services import adjust_stock
from core.exceptions import InsufficientStock

from .models import Category, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ["name", "slug", "is_active", "sort_order"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["is_active", "sort_order"]


class ProductImageInline(TabularInline):
    model = ProductImage
    extra = 1


class StockAdjustForm(forms.Form):
    quantity_delta = forms.IntegerField(help_text="Positive to add stock, negative to remove.")
    reason = forms.ChoiceField(choices=StockMovement.Reason.choices)
    note = forms.CharField(required=False, widget=forms.Textarea(attrs={"rows": 3}))


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = [
        "name",
        "sku",
        "category",
        "price",
        "stock_quantity",
        "stock_status",
        "is_active",
    ]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "sku"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["stock_quantity"]  # changed only through adjust_stock
    inlines = [ProductImageInline]
    actions = ["adjust_stock_action"]

    @display(description="Stock", label={"Sold out": "danger", "Low": "warning", "OK": "success"})
    def stock_status(self, obj):
        if obj.stock_quantity == 0:
            return "Sold out"
        return "Low" if obj.is_low_stock else "OK"

    @admin.display(boolean=True)
    def is_low_stock(self, obj):
        return obj.is_low_stock

    @action(description="Adjust stock for selected products")
    def adjust_stock_action(self, request, queryset):
        ids = ",".join(str(pk) for pk in queryset.values_list("pk", flat=True))
        return redirect(f"adjust-stock/?ids={ids}")

    def get_urls(self):
        return [
            path(
                "adjust-stock/",
                self.admin_site.admin_view(self.adjust_stock_view),
                name="catalog_product_adjust_stock",
            ),
            *super().get_urls(),
        ]

    def adjust_stock_view(self, request):
        ids = [int(i) for i in request.GET.get("ids", "").split(",") if i]
        products = Product.objects.filter(pk__in=ids)
        form = StockAdjustForm(request.POST or None)
        if request.method == "POST" and form.is_valid():
            for product in products:
                try:
                    adjust_stock(
                        product.pk,
                        form.cleaned_data["quantity_delta"],
                        form.cleaned_data["reason"],
                        user=request.user,
                        note=form.cleaned_data["note"],
                    )
                except InsufficientStock as exc:
                    messages.error(request, f"{product.name}: {exc.detail}")
                else:
                    messages.success(request, f"{product.name}: stock adjusted.")
            return redirect("admin:catalog_product_changelist")
        context = {
            **self.admin_site.each_context(request),
            "title": "Adjust stock",
            "form": form,
            "products": products,
            "opts": self.model._meta,
        }
        return render(request, "admin/catalog/adjust_stock.html", context)
