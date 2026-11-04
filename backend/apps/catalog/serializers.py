from rest_framework import serializers

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "price",
            "category",
            "stock_quantity",
            "in_stock",
            "is_low_stock",
            "primary_image",
        ]

    def get_primary_image(self, obj):
        # Relative URL: /media is proxied by Vite (dev) and nginx (prod), so no host needed.
        img = next(iter(obj.images.all()), None)
        return img.image.url if img else None


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ["description", "images"]


class ProductWriteSerializer(serializers.ModelSerializer):
    """Staff-only serializer. stock_quantity is read-only; use the adjustments endpoint."""

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "price",
            "category",
            "stock_quantity",
            "low_stock_threshold",
            "is_active",
        ]
        read_only_fields = ["stock_quantity"]
