from rest_framework import serializers

from apps.catalog.models import Product

from .models import StockMovement


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "product",
            "product_name",
            "quantity_delta",
            "reason",
            "reference",
            "note",
            "stock_after",
            "created_by_email",
            "created_at",
        ]


class StockAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity_delta = serializers.IntegerField()
    reason = serializers.ChoiceField(choices=StockMovement.Reason.choices)
    note = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_quantity_delta(self, value):
        if value == 0:
            raise serializers.ValidationError("quantity_delta must be non-zero.")
        return value
