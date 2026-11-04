"""The only write path for Product.stock_quantity."""

from contextlib import contextmanager
from threading import Lock

from django.db import connection, transaction

from apps.catalog.models import Product
from core.exceptions import InsufficientStock

from .models import StockMovement

_sqlite_product_locks: dict[int, Lock] = {}
_sqlite_product_locks_guard = Lock()


@contextmanager
def _product_lock(product_id: int):
    """Serialize local SQLite adjustments for one product.

    SQLite does not implement row-level ``SELECT ... FOR UPDATE`` locks. The
    development server runs in one process, so a per-product lock preserves
    the same no-lost-update guarantee there without changing PostgreSQL.
    """
    if connection.vendor != "sqlite":
        yield
        return
    with _sqlite_product_locks_guard:
        lock = _sqlite_product_locks.setdefault(product_id, Lock())
    with lock:
        yield


def adjust_stock(
    product_id: int,
    delta: int,
    reason: str,
    *,
    user=None,
    reference: str = "",
    note: str = "",
) -> StockMovement:
    """Atomically change a product's stock and record the movement.

    Locks the product row so concurrent adjustments serialize correctly.
    Raises InsufficientStock if the result would go negative.
    """
    with _product_lock(product_id):
        with transaction.atomic():
            product = Product.objects.select_for_update().get(pk=product_id)
            new_quantity = product.stock_quantity + delta
            if new_quantity < 0:
                raise InsufficientStock(
                    f"Insufficient stock for {product.name}.",
                    insufficient=[
                        {
                            "product_id": product.pk,
                            "name": product.name,
                            "requested": -delta,
                            "available": product.stock_quantity,
                        }
                    ],
                )
            product.stock_quantity = new_quantity
            product.save(update_fields=["stock_quantity", "updated_at"])
            return StockMovement.objects.create(
                product=product,
                quantity_delta=delta,
                reason=reason,
                reference=reference,
                note=note,
                stock_after=new_quantity,
                created_by=user if (user and user.is_authenticated) else None,
            )
