"""School-project payment simulation; no payment is collected or verified."""

import uuid

from apps.orders.models import Order
from apps.orders.services import mark_paid


class FakeProvider:
    name = "school-demo-simulation"

    def create_intent(self, order: Order) -> dict:
        return {
            "provider": self.name,
            "simulation": True,
            "message": "School-project simulation only; no payment is collected or verified.",
            "order_number": order.number,
            "amount": str(order.total),
        }

    def confirm(self, order: Order, payload: dict) -> Order:
        return mark_paid(order, reference=f"SIMULATED_{uuid.uuid4().hex[:12]}")
