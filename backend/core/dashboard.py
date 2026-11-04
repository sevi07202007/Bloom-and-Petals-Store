"""Context for the admin dashboard (UNFOLD["DASHBOARD_CALLBACK"])."""

from datetime import date, timedelta

from django.db.models import Count, F, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.catalog.models import Product
from apps.inventory.models import StockMovement
from apps.orders.models import Order


def dashboard_callback(request, context):
    now = timezone.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=6)

    paid = Order.objects.exclude(status=Order.Status.CANCELLED)
    revenue_7d = paid.filter(created_at__gte=week_ago).aggregate(t=Sum("total"))["t"] or 0
    orders_today = Order.objects.filter(created_at__gte=today).count()
    pending = Order.objects.filter(status=Order.Status.PENDING).count()
    to_fulfil = Order.objects.filter(status=Order.Status.PAID).count()
    low_stock = (
        Product.objects.filter(is_active=True, stock_quantity__lte=F("low_stock_threshold"))
        .select_related("category")
        .order_by("stock_quantity")
    )

    # 7-day sparkline of order counts
    counts = {}
    for row in (
        Order.objects.filter(created_at__gte=week_ago)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(n=Count("id"))
    ):
        day = row["day"]
        counts[day if isinstance(day, date) else day.date()] = row["n"]
    days = [(week_ago + timedelta(days=i)).date() for i in range(7)]
    series = [counts.get(d, 0) for d in days]
    peak = max(series) or 1

    context.update(
        {
            "kpis": [
                {"label": "Revenue, last 7 days", "value": f"${revenue_7d:,.2f}"},
                {"label": "Orders today", "value": orders_today},
                {"label": "To fulfil", "value": to_fulfil, "highlight": to_fulfil > 0},
                {"label": "Awaiting payment", "value": pending},
                {"label": "Low-stock products", "value": low_stock.count()},
            ],
            "low_stock": low_stock[:8],
            "recent_orders": Order.objects.select_related("user").order_by("-created_at")[:8],
            "recent_movements": StockMovement.objects.select_related("product", "created_by")[:8],
            "chart": [
                {"day": d.strftime("%a"), "n": n, "pct": int(n / peak * 100)}
                for d, n in zip(days, series, strict=True)
            ],
        }
    )
    return context
