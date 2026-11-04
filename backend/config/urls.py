from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.errors import preview
from core.health import health
from core.views import root

handler403 = "core.errors.forbidden"
handler404 = "core.errors.not_found"
handler500 = "core.errors.server_error"

urlpatterns = [
    path("", root, name="root"),
    path("admin/errors/<int:code>/", admin.site.admin_view(preview), name="error-preview"),
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
