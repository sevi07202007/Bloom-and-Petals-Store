import threading

import pytest
from django.db import connection

from apps.inventory.models import StockMovement
from apps.inventory.services import adjust_stock
from core.exceptions import InsufficientStock
from tests.factories import ProductFactory

pytestmark = pytest.mark.django_db


def test_adjust_creates_movement_and_updates_stock(product, staff_user):
    movement = adjust_stock(
        product.pk, -3, StockMovement.Reason.SALE, user=staff_user, reference="BP-1"
    )
    product.refresh_from_db()
    assert product.stock_quantity == 7
    assert movement.stock_after == 7
    assert movement.created_by == staff_user
    assert movement.reference == "BP-1"


def test_adjust_rejects_negative(product):
    with pytest.raises(InsufficientStock) as exc:
        adjust_stock(product.pk, -11, StockMovement.Reason.SALE)
    product.refresh_from_db()
    assert product.stock_quantity == 10
    assert exc.value.extra["insufficient"][0]["available"] == 10
    assert StockMovement.objects.count() == 0


@pytest.mark.django_db(transaction=True)
def test_concurrent_adjustments_serialize():
    product = ProductFactory(stock_quantity=5)
    barrier = threading.Barrier(10)
    results = []

    def worker():
        try:
            barrier.wait()
            adjust_stock(product.pk, -1, StockMovement.Reason.SALE)
            results.append("ok")
        except InsufficientStock:
            results.append("fail")
        finally:
            connection.close()

    threads = [threading.Thread(target=worker) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    product.refresh_from_db()
    assert product.stock_quantity == 0
    assert results.count("ok") == 5
    assert results.count("fail") == 5
    assert StockMovement.objects.filter(product=product).count() == 5
