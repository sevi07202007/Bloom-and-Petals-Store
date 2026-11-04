import threading

import pytest
from django.db import connection

from apps.inventory.models import StockMovement
from apps.orders.models import CartItem, Order
from apps.orders.services import EmptyCart, cancel_order, checkout, get_or_create_cart
from core.exceptions import InsufficientStock, InvalidOrderState
from tests.factories import ProductFactory, UserFactory

pytestmark = pytest.mark.django_db

SHIPPING = {
    "shipping_name": "T X",
    "shipping_address1": "1 Main",
    "shipping_city": "Town",
    "shipping_postal_code": "00000",
    "shipping_country": "US",
}


def add(user, product, qty):
    CartItem.objects.create(cart=get_or_create_cart(user), product=product, quantity=qty)


def test_checkout_creates_order_and_decrements_stock(user, product):
    add(user, product, 2)
    order = checkout(user, SHIPPING)
    product.refresh_from_db()
    assert order.number.startswith("BP-")
    assert order.status == Order.Status.PENDING
    assert order.total == product.price * 2
    assert order.items.count() == 1
    assert product.stock_quantity == 8
    assert StockMovement.objects.get(reference=order.number).quantity_delta == -2
    assert get_or_create_cart(user).items.count() == 0


def test_checkout_insufficient_rolls_back(user, product):
    other = ProductFactory(stock_quantity=1)
    add(user, product, 1)
    add(user, other, 5)
    with pytest.raises(InsufficientStock) as exc:
        checkout(user, SHIPPING)
    assert exc.value.extra["insufficient"][0]["product_id"] == other.pk
    product.refresh_from_db()
    assert product.stock_quantity == 10
    assert Order.objects.count() == 0
    assert StockMovement.objects.count() == 0
    assert get_or_create_cart(user).items.count() == 2


def test_checkout_api_409(auth_client, user, product):
    add(user, product, 50)
    resp = auth_client.post("/api/checkout/", SHIPPING, format="json")
    assert resp.status_code == 409
    assert resp.data["insufficient"][0]["requested"] == 50


def test_checkout_api_empty_cart(auth_client):
    resp = auth_client.post("/api/checkout/", SHIPPING, format="json")
    assert resp.status_code == 400


def test_orders_scoped_to_owner(auth_client, user, product):
    add(user, product, 1)
    mine = checkout(user, SHIPPING)
    other = UserFactory()
    add(other, product, 1)
    theirs = checkout(other, SHIPPING)

    resp = auth_client.get("/api/orders/")
    assert [o["number"] for o in resp.data["results"]] == [mine.number]
    assert auth_client.get(f"/api/orders/{theirs.number}/").status_code == 404


def test_checkout_cannot_create_a_second_order_from_the_cleared_cart(user, product):
    add(user, product, 1)
    checkout(user, SHIPPING)
    with pytest.raises(EmptyCart):
        checkout(user, SHIPPING)
    assert Order.objects.count() == 1


def test_cancelling_with_a_stale_order_instance_only_restocks_once(user, product):
    add(user, product, 1)
    order = checkout(user, SHIPPING)
    stale_order = Order.objects.get(pk=order.pk)
    cancel_order(order)
    with pytest.raises(InvalidOrderState):
        cancel_order(stale_order)
    product.refresh_from_db()
    assert product.stock_quantity == 10
    assert StockMovement.objects.filter(reference=order.number).count() == 2


@pytest.mark.django_db(transaction=True)
def test_concurrent_checkout_last_unit():
    product = ProductFactory(stock_quantity=1)
    users = [UserFactory(), UserFactory()]
    for u in users:
        add(u, product, 1)
    barrier = threading.Barrier(2)
    outcomes = []

    def worker(u):
        try:
            barrier.wait()
            checkout(u, SHIPPING)
            outcomes.append("ok")
        except InsufficientStock:
            outcomes.append("fail")
        finally:
            connection.close()

    threads = [threading.Thread(target=worker, args=(u,)) for u in users]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    product.refresh_from_db()
    assert sorted(outcomes) == ["fail", "ok"]
    assert Order.objects.count() == 1
    assert product.stock_quantity == 0
    assert StockMovement.objects.count() == 1
