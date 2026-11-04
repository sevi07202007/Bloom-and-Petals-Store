from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.serializers import ProductListSerializer

from .models import Cart, CartItem, Order, OrderItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product", write_only=True
    )
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "line_total"]

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

    def validate(self, attrs):
        product = attrs.get("product")
        if product is None and self.instance is not None:
            product = self.instance.product
        quantity = attrs.get("quantity")
        if product is not None and not product.is_active:
            raise serializers.ValidationError(
                {"product_id": "This product is no longer available."}
            )
        if product is not None and quantity is not None and quantity > product.stock_quantity:
            raise serializers.ValidationError(
                {"quantity": "Quantity exceeds the currently available stock."}
            )
        return attrs


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "item_count"]

    def get_item_count(self, cart):
        return sum(i.quantity for i in cart.items.all())


class CartMergeItemSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True), source="product"
    )
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        if attrs["quantity"] > attrs["product"].stock_quantity:
            raise serializers.ValidationError(
                {"quantity": "Quantity exceeds the currently available stock."}
            )
        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "unit_price", "quantity", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "number",
            "status",
            "subtotal",
            "total",
            "items",
            "shipping_name",
            "shipping_address1",
            "shipping_address2",
            "shipping_city",
            "shipping_postal_code",
            "shipping_country",
            "shipping_phone",
            "notes",
            "paid_at",
            "payment_reference",
            "created_at",
        ]
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    shipping_name = serializers.CharField(max_length=200)
    shipping_address1 = serializers.CharField(max_length=200)
    shipping_address2 = serializers.CharField(
        max_length=200, required=False, allow_blank=True, default=""
    )
    shipping_city = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=2, default="US")
    shipping_phone = serializers.CharField(
        max_length=30, required=False, allow_blank=True, default=""
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
