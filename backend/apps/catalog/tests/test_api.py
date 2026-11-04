import pytest

from tests.factories import ProductFactory

pytestmark = pytest.mark.django_db


def test_list_products_public(api_client, product):
    resp = api_client.get("/api/products/")
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["slug"] == product.slug


def test_detail_by_slug(api_client, product):
    resp = api_client.get(f"/api/products/{product.slug}/")
    assert resp.status_code == 200
    assert resp.data["in_stock"] is True


def test_filter_in_stock_and_category(api_client, category):
    ProductFactory(category=category, stock_quantity=0)
    ProductFactory(category=category, stock_quantity=3)
    resp = api_client.get("/api/products/", {"in_stock": "true", "category": category.slug})
    assert resp.data["count"] == 1


def test_inactive_hidden(api_client, category):
    ProductFactory(category=category, is_active=False)
    assert api_client.get("/api/products/").data["count"] == 0
