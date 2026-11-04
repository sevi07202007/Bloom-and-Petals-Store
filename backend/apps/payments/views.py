from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer

from .providers.base import get_provider


class PaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, number):
        order = get_object_or_404(Order, number=number, user=request.user)
        return Response(get_provider().create_intent(order))


class PaymentConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, number):
        order = get_object_or_404(Order, number=number, user=request.user)
        order = get_provider().confirm(order, request.data)
        data = OrderSerializer(order).data
        data["payment_simulated"] = True
        data["payment_message"] = (
            "School-project simulation only; no payment was collected or verified."
        )
        return Response(data)
