from django.db import transaction
from django.db.models import F
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CartItem, Order
from .serializers import (
    CartItemSerializer,
    CartMergeItemSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
)
from .services import checkout, get_or_create_cart


class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart, context={"request": request}).data)

    def delete(self, request):
        get_or_create_cart(request.user).items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user).select_related("product")

    def create(self, request, *args, **kwargs):
        """Upsert: adding an existing product increments its quantity."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request.user)
        product = serializer.validated_data["product"]
        qty = serializer.validated_data["quantity"]
        with transaction.atomic():
            item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={"quantity": qty}
            )
            if not created:
                if item.quantity + qty > product.stock_quantity:
                    from rest_framework.exceptions import ValidationError

                    raise ValidationError(
                        {"quantity": "Quantity exceeds the currently available stock."}
                    )
                CartItem.objects.filter(pk=item.pk).update(quantity=F("quantity") + qty)
                item.refresh_from_db()
        return Response(
            self.get_serializer(item).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=False, methods=["post"], url_path="merge")
    def merge(self, request):
        """Merge a guest (localStorage) cart into the server cart after login."""
        serializer = CartMergeItemSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request.user)
        with transaction.atomic():
            requested_by_product = {}
            for row in serializer.validated_data:
                product = row["product"]
                requested_by_product[product.pk] = (
                    requested_by_product.get(product.pk, 0) + row["quantity"]
                )
            existing_by_product = {
                item.product_id: item.quantity
                for item in CartItem.objects.filter(
                    cart=cart, product_id__in=requested_by_product
                )
            }
            for product_id, quantity in requested_by_product.items():
                product = next(
                    row["product"]
                    for row in serializer.validated_data
                    if row["product"].pk == product_id
                )
                if existing_by_product.get(product_id, 0) + quantity > product.stock_quantity:
                    from rest_framework.exceptions import ValidationError

                    raise ValidationError(
                        {"quantity": "Quantity exceeds the currently available stock."}
                    )
            for row in serializer.validated_data:
                item, created = CartItem.objects.get_or_create(
                    cart=cart, product=row["product"], defaults={"quantity": row["quantity"]}
                )
                if not created:
                    CartItem.objects.filter(pk=item.pk).update(
                        quantity=F("quantity") + row["quantity"]
                    )
        return Response(CartSerializer(cart, context={"request": request}).data)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = checkout(request.user, serializer.validated_data)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "number"

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items")
        if self.request.user.is_staff and self.request.query_params.get("all") == "1":
            return qs
        return qs.filter(user=self.request.user)
