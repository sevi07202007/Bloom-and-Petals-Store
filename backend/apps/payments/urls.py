from django.urls import path

from .views import PaymentConfirmView, PaymentIntentView

urlpatterns = [
    path("<str:number>/intent/", PaymentIntentView.as_view(), name="payment-intent"),
    path("<str:number>/confirm/", PaymentConfirmView.as_view(), name="payment-confirm"),
]
