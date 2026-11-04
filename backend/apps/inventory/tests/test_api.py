import pytest

pytestmark = pytest.mark.django_db


def test_adjustment_requires_staff(auth_client, product):
    resp = auth_client.post(
        "/api/inventory/adjustments/",
        {"product_id": product.pk, "quantity_delta": 5, "reason": "restock"},
        format="json",
    )
    assert resp.status_code == 403


def test_staff_adjustment(staff_client, product):
    resp = staff_client.post(
        "/api/inventory/adjustments/",
        {"product_id": product.pk, "quantity_delta": 5, "reason": "restock", "note": "delivery"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["stock_after"] == 15

    movements = staff_client.get("/api/inventory/movements/", {"product": product.pk})
    assert movements.data["count"] == 1


def test_staff_adjustment_negative_conflict(staff_client, product):
    resp = staff_client.post(
        "/api/inventory/adjustments/",
        {"product_id": product.pk, "quantity_delta": -50, "reason": "damage"},
        format="json",
    )
    assert resp.status_code == 409
    assert "insufficient" in resp.data


def test_low_stock(staff_client, product):
    product.low_stock_threshold = 10
    product.save()
    resp = staff_client.get("/api/inventory/products/low-stock/")
    assert resp.status_code == 200
    assert [p["id"] for p in resp.data] == [product.pk]


def test_order_queue_counts(staff_client, user, product):
    from apps.orders.models import CartItem
    from apps.orders.services import checkout, get_or_create_cart, mark_paid

    CartItem.objects.create(cart=get_or_create_cart(user), product=product, quantity=1)
    order = checkout(
        user,
        {
            "shipping_name": "T",
            "shipping_address1": "1",
            "shipping_city": "C",
            "shipping_postal_code": "0",
            "shipping_country": "US",
        },
    )
    resp = staff_client.get("/api/inventory/orders/queue/")
    assert resp.status_code == 200
    assert resp.data["awaiting_payment"] == 1 and resp.data["to_fulfil"] == 0
    mark_paid(order)
    resp = staff_client.get("/api/inventory/orders/queue/")
    assert resp.data["to_fulfil"] == 1
    assert resp.data["latest"][0]["number"] == order.number


def test_order_queue_requires_staff(auth_client):
    assert auth_client.get("/api/inventory/orders/queue/").status_code == 403
