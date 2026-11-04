"""Error handlers.

- /api/*            -> JSON (DRF handles most; these cover routing-level 404/403/500)
- /admin/* (staff)  -> themed page inside the admin shell
- everything else   -> standalone branded page
"""

from django.contrib import admin
from django.http import JsonResponse
from django.shortcuts import render


def _is_api(request) -> bool:
    return request.path.startswith("/api/")


def _in_admin(request) -> bool:
    user = getattr(request, "user", None)
    return request.path.startswith("/admin/") and bool(user and user.is_active and user.is_staff)


def _render(request, code: int, exception=None):
    if _is_api(request):
        return JsonResponse(
            {"detail": {404: "Not found.", 403: "Forbidden.", 500: "Server error."}[code]},
            status=code,
        )
    if _in_admin(request):
        context = {**admin.site.each_context(request), "detail": str(exception or "") or None}
        return render(request, f"admin/errors/{code}.html", context, status=code)
    return render(request, f"{code}.html", status=code)


def not_found(request, exception=None):
    return _render(request, 404)


def forbidden(request, exception=None):
    return _render(request, 403, exception)


def server_error(request):
    try:
        return _render(request, 500)
    except Exception:  # never let the error page itself fail
        return render(request, "500.html", status=500)


def preview(request, code: int):
    """DEBUG-only: render an error page without triggering the error (e.g. /admin/errors/404/)."""
    from django.conf import settings
    from django.http import Http404

    if not settings.DEBUG or code not in (403, 404, 500):
        raise Http404
    return _render(request, code)
