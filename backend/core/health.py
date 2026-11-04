from django.db import connection
from django.http import JsonResponse


def health(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "database": "ok"})
    except Exception as exc:  # pragma: no cover
        return JsonResponse({"status": "error", "database": str(exc)}, status=503)
