from django.conf import settings
from django.shortcuts import redirect


def root(request):
    """The backend has no homepage: send people to the storefront (dev) or the admin (prod)."""
    target = settings.FRONTEND_URL if settings.DEBUG else "/admin/"
    return redirect(target)
