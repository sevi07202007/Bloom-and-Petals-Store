import pytest

from tests.factories import ProductFactory

pytestmark = pytest.mark.django_db


def test_add_item_upserts(auth_client, product):
    r1 = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 1}, format="json"
    )
    assert r1.status_code == 201
    r2 = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 2}, format="json"
    )
    assert r2.status_code == 200
    assert r2.data["quantity"] == 3
    cart = auth_client.get("/api/cart/").data
    assert cart["item_count"] == 3
    assert cart["subtotal"] == "30.00"


def test_merge(auth_client, product):
    other = ProductFactory()
    auth_client.post("/api/cart/items/", {"product_id": product.pk, "quantity": 1}, format="json")
    resp = auth_client.post(
        "/api/cart/merge/",
        [{"product_id": product.pk, "quantity": 2}, {"product_id": other.pk, "quantity": 1}],
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["item_count"] == 4


def test_update_and_delete_item(auth_client, product):
    item = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 1}, format="json"
    ).data
    assert (
        auth_client.patch(f"/api/cart/items/{item['id']}/", {"quantity": 4}, format="json").data[
            "quantity"
        ]
        == 4
    )
    assert auth_client.delete(f"/api/cart/items/{item['id']}/").status_code == 204
    assert auth_client.get("/api/cart/").data["item_count"] == 0


def test_cart_requires_auth(api_client):
    assert api_client.get("/api/cart/").status_code == 401


def test_cart_rejects_inactive_or_insufficient_products(auth_client, product):
    product.is_active = False
    product.save(update_fields=["is_active"])
    inactive = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 1}, format="json"
    )
    assert inactive.status_code == 400
    inactive_merge = auth_client.post(
        "/api/cart/merge/", [{"product_id": product.pk, "quantity": 1}], format="json"
    )
    assert inactive_merge.status_code == 400

    product.is_active = True
    product.stock_quantity = 2
    product.save(update_fields=["is_active", "stock_quantity"])
    too_many = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 3}, format="json"
    )
    assert too_many.status_code == 400


def test_cart_rejects_quantity_above_available_on_update_or_merge(auth_client, product):
    product.stock_quantity = 3
    product.save(update_fields=["stock_quantity"])
    item = auth_client.post(
        "/api/cart/items/", {"product_id": product.pk, "quantity": 2}, format="json"
    ).data

    product.is_active = False
    product.save(update_fields=["is_active"])
    inactive_update = auth_client.patch(
        f"/api/cart/items/{item['id']}/", {"quantity": 2}, format="json"
    )
    assert inactive_update.status_code == 400

    product.is_active = True
    product.save(update_fields=["is_active"])
    update = auth_client.patch(
        f"/api/cart/items/{item['id']}/", {"quantity": 4}, format="json"
    )
    assert update.status_code == 400

    merge = auth_client.post(
        "/api/cart/merge/", [{"product_id": product.pk, "quantity": 2}], format="json"
    )
    assert merge.status_code == 400
