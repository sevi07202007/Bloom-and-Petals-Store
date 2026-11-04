from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CartItemViewSet, CartView, CheckoutView, OrderViewSet

router = DefaultRouter()
router.register("cart/items", CartItemViewSet, basename="cart-item")
router.register("orders", OrderViewSet, basename="order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/clear/", CartView.as_view(), name="cart-clear"),
    path("cart/merge/", CartItemViewSet.as_view({"post": "merge"}), name="cart-merge"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    *router.urls,
]
