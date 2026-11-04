"""Seed a few demo orders for the demo customers (exercises checkout + stock). Idempotent."""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.catalog.models import Product
from apps.orders.models import CartItem, Order
from apps.orders.services import checkout, get_or_create_cart, mark_paid

User = get_user_model()

SHIPPING = {
    "shipping_name": "Demo Customer",
    "shipping_address1": "12 Petal Lane",
    "shipping_city": "Springfield",
    "shipping_postal_code": "12345",
    "shipping_country": "US",
}


class Command(BaseCommand):
    help = "Seed demo orders"

    def handle(self, *args, **options):
        if Order.objects.exists():
            self.stdout.write("Orders already exist, skipping.")
            return
        products = list(Product.objects.filter(stock_quantity__gte=3).order_by("pk")[:6])
        if not products:
            self.stdout.write(self.style.WARNING("No stocked products; run seed_catalog first."))
            return

        plans = [
            ("jane@example.com", [(products[0], 1), (products[1], 2)], True),
            ("jane@example.com", [(products[2], 1)], False),
            ("ravi@example.com", [(products[3], 3), (products[4], 1)], True),
        ]
        for email, lines, pay in plans:
            user = User.objects.filter(email=email).first()
            if not user:
                continue
            cart = get_or_create_cart(user)
            for product, qty in lines:
                CartItem.objects.update_or_create(
                    cart=cart, product=product, defaults={"quantity": qty}
                )
            order = checkout(user, {**SHIPPING, "shipping_name": user.get_full_name()})
            if pay:
                mark_paid(order, reference="seed")
            self.stdout.write(f"Created {order.number} ({order.status})")
        self.stdout.write(self.style.SUCCESS("Seeded demo orders."))
