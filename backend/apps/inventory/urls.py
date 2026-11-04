from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import OrderQueueView, StaffProductViewSet, StockAdjustmentView, StockMovementListView

router = DefaultRouter()
router.register("products", StaffProductViewSet, basename="inventory-product")

urlpatterns = [
    path("adjustments/", StockAdjustmentView.as_view(), name="stock-adjust"),
    path("movements/", StockMovementListView.as_view(), name="stock-movements"),
    path("orders/queue/", OrderQueueView.as_view(), name="order-queue"),
    *router.urls,
]
