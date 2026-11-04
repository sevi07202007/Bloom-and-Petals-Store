from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.catalog.serializers import ProductWriteSerializer
from apps.orders.models import Order
from core.permissions import IsStaff

from .models import StockMovement
from .serializers import StockAdjustmentSerializer, StockMovementSerializer
from .services import adjust_stock


class StaffProductViewSet(viewsets.ModelViewSet):
    """Full product CRUD for staff, including inactive products."""

    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductWriteSerializer
    permission_classes = [IsStaff]
    filterset_fields = ["category", "is_active"]
    search_fields = ["name", "sku"]
    ordering_fields = ["name", "stock_quantity", "price"]

    @action(detail=False, methods=["get"], url_path="low-stock")
    def low_stock(self, request):
        qs = self.get_queryset().filter(stock_quantity__lte=F("low_stock_threshold"))
        return Response(self.get_serializer(qs, many=True).data)


class StockAdjustmentView(APIView):
    permission_classes = [IsStaff]

    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        movement = adjust_stock(
            data["product_id"].pk,
            data["quantity_delta"],
            data["reason"],
            user=request.user,
            note=data["note"],
        )
        return Response(StockMovementSerializer(movement).data, status=status.HTTP_201_CREATED)


class StockMovementListView(ListAPIView):
    queryset = StockMovement.objects.select_related("product", "created_by")
    serializer_class = StockMovementSerializer
    permission_classes = [IsStaff]
    filterset_fields = {"product": ["exact"], "reason": ["exact"], "created_at": ["gte", "lte"]}


class OrderQueueView(APIView):
    """Counts and latest orders for the admin notification badge."""

    permission_classes = [IsStaff]

    def get(self, request):
        latest = Order.objects.select_related("user").order_by("-id")[:5]
        return Response(
            {
                "to_fulfil": Order.objects.filter(status=Order.Status.PAID).count(),
                "awaiting_payment": Order.objects.filter(status=Order.Status.PENDING).count(),
                "latest": [
                    {
                        "id": o.id,
                        "number": o.number,
                        "status": o.status,
                        "total": str(o.total),
                        "customer": o.user.get_full_name() or o.user.email,
                        "created_at": o.created_at.isoformat(),
                    }
                    for o in latest
                ],
            }
        )
