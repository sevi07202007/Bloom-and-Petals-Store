"""Checkout and order lifecycle. All stock changes go through inventory.services.adjust_stock."""

from contextlib import contextmanager
from decimal import Decimal
from threading import Lock

from django.db import connection, transaction
from django.utils import timezone

from apps.catalog.models import Product
from apps.inventory.models import StockMovement
from apps.inventory.services import adjust_stock
from core.exceptions import DomainError, InsufficientStock, InvalidOrderState

from .models import Cart, Order, OrderItem

_sqlite_order_locks: dict[int, Lock] = {}
_sqlite_order_locks_guard = Lock()
_sqlite_checkout_lock = Lock()


@contextmanager
def _checkout_lock():
    """Serialize local SQLite checkout transactions.

    SQLite ignores ``SELECT ... FOR UPDATE`` and permits only one writer. The
    development server is a single process, so this lock safely serializes
    checkout across users competing for the same inventory.
    """
    if connection.vendor != "sqlite":
        yield
        return
    with _sqlite_checkout_lock:
        yield


@contextmanager
def _order_cancellation_lock(order_id: int):
    """Provide the same local serialization for cancellation on SQLite."""
    if connection.vendor != "sqlite":
        yield
        return
    with _sqlite_order_locks_guard:
        lock = _sqlite_order_locks.setdefault(order_id, Lock())
    with lock:
        yield


class EmptyCart(DomainError):
    default_detail = "Your cart is empty."


def get_or_create_cart(user) -> Cart:
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


def checkout(user, shipping: dict) -> Order:
    """Create an order from the user's cart and decrement stock atomically.

    Products are locked in pk order (deterministic lock order prevents deadlocks).
    All stock is validated before any order rows are written, so a shortfall on
    any line rolls the whole thing back.
    """
    with _checkout_lock():
        with transaction.atomic():
            # Serialise checkouts for one customer as well as locking the inventory
            # rows below.  This makes a repeated request observe the cart cleared by
            # the first successful checkout instead of creating a second order.
            cart = get_or_create_cart(user)
            cart = Cart.objects.select_for_update().get(pk=cart.pk)
            items = list(cart.items.select_related("product").order_by("product_id"))
            if not items:
                raise EmptyCart()

            product_ids = [i.product_id for i in items]
            locked = {
                p.pk: p
                for p in Product.objects.select_for_update()
                .filter(pk__in=product_ids)
                .order_by("pk")
            }

            insufficient = [
                {
                    "product_id": item.product_id,
                    "name": locked[item.product_id].name,
                    "requested": item.quantity,
                    "available": locked[item.product_id].stock_quantity,
                }
                for item in items
                if locked[item.product_id].stock_quantity < item.quantity
                or not locked[item.product_id].is_active
            ]
            if insufficient:
                raise InsufficientStock(insufficient=insufficient)

            subtotal = sum(
                (locked[i.product_id].price * i.quantity for i in items), start=Decimal("0")
            )
            order = Order.objects.create(user=user, subtotal=subtotal, total=subtotal, **shipping)

            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        product=locked[i.product_id],
                        product_name=locked[i.product_id].name,
                        unit_price=locked[i.product_id].price,
                        quantity=i.quantity,
                        line_total=locked[i.product_id].price * i.quantity,
                    )
                    for i in items
                ]
            )
            for item in items:
                adjust_stock(
                    item.product_id,
                    -item.quantity,
                    StockMovement.Reason.SALE,
                    user=user,
                    reference=order.number,
                )
            cart.items.all().delete()
            return order


@transaction.atomic
def mark_paid(order: Order, reference: str = "") -> Order:
    if order.status != Order.Status.PENDING:
        raise InvalidOrderState("Order is not awaiting payment.")
    order.status = Order.Status.PAID
    order.paid_at = timezone.now()
    order.payment_reference = reference
    order.save(update_fields=["status", "paid_at", "payment_reference", "updated_at"])
    return order


@transaction.atomic
def cancel_order(order: Order, *, user=None) -> Order:
    """Cancel a pending/paid order and return its stock."""
    with _order_cancellation_lock(order.pk):
        # Never trust a model instance supplied by an admin action: it may have
        # become stale while another request fulfilled or cancelled the order.
        # Locking and reloading makes the state check and restock one operation.
        order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
        if order.status not in (Order.Status.PENDING, Order.Status.PAID):
            raise InvalidOrderState("Only pending or paid orders can be cancelled.")
        for item in order.items.all():
            adjust_stock(
                item.product_id,
                item.quantity,
                StockMovement.Reason.RETURN,
                user=user,
                reference=order.number,
            )
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        return order
