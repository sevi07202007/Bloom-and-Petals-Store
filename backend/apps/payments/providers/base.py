"""Payment provider interface. Swap implementations via settings.PAYMENT_PROVIDER."""

from typing import Protocol

from django.conf import settings
from django.utils.module_loading import import_string

from apps.orders.models import Order


class PaymentProvider(Protocol):
    name: str

    def create_intent(self, order: Order) -> dict:
        """Return client-facing data needed to collect payment (e.g. a client_secret)."""
        ...

    def confirm(self, order: Order, payload: dict) -> Order:
        """Verify payment and mark the order paid. Must raise on failure."""
        ...


def get_provider() -> PaymentProvider:
    return import_string(settings.PAYMENT_PROVIDER)()
