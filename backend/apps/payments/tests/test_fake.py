import pytest

from apps.orders.models import CartItem
from apps.orders.services import checkout, get_or_create_cart

pytestmark = pytest.mark.django_db

SHIPPING = {
    "shipping_name": "T X",
    "shipping_address1": "1 Main",
    "shipping_city": "Town",
    "shipping_postal_code": "00000",
    "shipping_country": "US",
}


def test_fake_payment_marks_paid(auth_client, user, product):
    CartItem.objects.create(cart=get_or_create_cart(user), product=product, quantity=1)
    order = checkout(user, SHIPPING)

    intent = auth_client.post(f"/api/payments/{order.number}/intent/")
    assert intent.status_code == 200
    assert intent.data["provider"] == "school-demo-simulation"
    assert intent.data["simulation"] is True

    resp = auth_client.post(f"/api/payments/{order.number}/confirm/")
    assert resp.status_code == 200
    assert resp.data["status"] == "paid"
    assert resp.data["payment_reference"].startswith("SIMULATED_")
    assert resp.data["payment_simulated"] is True

    again = auth_client.post(f"/api/payments/{order.number}/confirm/")
    assert again.status_code == 409
