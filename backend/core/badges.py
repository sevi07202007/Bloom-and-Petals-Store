"""Sidebar badge callbacks for the admin (UNFOLD SIDEBAR navigation 'badge')."""

from apps.orders.models import Order


def orders_to_fulfil(request=None) -> int:
    """Paid orders that still need to be packed and delivered."""
    return Order.objects.filter(status=Order.Status.PAID).count()


def orders_badge(request):
    count = orders_to_fulfil(request)
    return count or ""
