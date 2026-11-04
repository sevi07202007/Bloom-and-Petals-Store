"""Shared settings. dev.py / prod.py / test.py extend this."""

from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DJANGO_DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
    CORS_ALLOWED_ORIGINS=(list, []),
    JWT_ACCESS_MINUTES=(int, 30),
    JWT_REFRESH_DAYS=(int, 7),
    PAYMENT_PROVIDER=(str, "apps.payments.providers.fake.FakeProvider"),
)
env.read_env(BASE_DIR / ".env")

# A project-local .env must always supply this value.  Deliberately do not
# provide a fallback: a missing secret should be caught at startup, not turn
# into a predictable signing key.
SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = env("DJANGO_ALLOWED_HOSTS")

INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third party
    "rest_framework",
    "django_filters",
    "corsheaders",
    "drf_spectacular",
    # local
    "core",
    "apps.accounts",
    "apps.catalog",
    "apps.inventory",
    "apps.orders",
    "apps.payments",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "core" / "templates"],  # project overrides win over unfold/admin
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASES = {"default": env.db("DATABASE_URL")}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_USER_MODEL = "accounts.User"
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticatedOrReadOnly",),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardPagination",
    "PAGE_SIZE": 24,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_RATES": {"auth": "20/min"},
    "EXCEPTION_HANDLER": "core.exceptions.exception_handler",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env("JWT_ACCESS_MINUTES")),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env("JWT_REFRESH_DAYS")),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Bloom & Petals API",
    "DESCRIPTION": "E-commerce and inventory API for the Bloom & Petals flower shop.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

PAYMENT_PROVIDER = env("PAYMENT_PROVIDER")
FRONTEND_URL = env("FRONTEND_URL", default="http://localhost:5173")


# ---- Admin theme (django-unfold) ----
UNFOLD = {
    "SITE_TITLE": "Bloom & Petals",
    "SITE_HEADER": "Bloom & Petals",
    "SITE_SUBHEADER": "Studio backoffice",
    "SITE_URL": "/",
    "SITE_ICON": lambda request: "/static/admin/logo.svg",
    "SITE_FAVICONS": [
        {
            "rel": "icon",
            "sizes": "any",
            "type": "image/svg+xml",
            "href": lambda request: "/static/admin/logo.svg",
        }
    ],
    "SHOW_HISTORY": True,
    "SHOW_VIEW_ON_SITE": False,
    "THEME": "light",
    "BORDER_RADIUS": "10px",
    "COLORS": {
        "base": {
            "50": "253 251 247",
            "100": "249 244 236",
            "200": "241 232 217",
            "300": "214 204 192",
            "400": "166 156 160",
            "500": "110 99 104",
            "600": "80 70 74",
            "700": "61 53 56",
            "800": "44 38 40",
            "900": "31 26 28",
            "950": "20 17 18",
        },
        "primary": {
            "50": "253 244 245",
            "100": "251 232 234",
            "200": "246 208 213",
            "300": "238 170 180",
            "400": "226 119 138",
            "500": "207 77 102",
            "600": "181 51 82",
            "700": "150 39 68",
            "800": "125 35 61",
            "900": "106 33 56",
            "950": "70 18 34",
        },
        "font": {
            "subtle-light": "110 99 104",
            "subtle-dark": "166 156 160",
            "default-light": "61 53 56",
            "default-dark": "241 232 217",
            "important-light": "31 26 28",
            "important-dark": "253 251 247",
        },
    },
    "STYLES": [lambda request: "/static/admin/bloom.css"],
    "SCRIPTS": [lambda request: "/static/admin/notify.js"],
    "DASHBOARD_CALLBACK": "core.dashboard.dashboard_callback",
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "Overview",
                "items": [
                    {"title": "Dashboard", "icon": "dashboard", "link": "/admin/"},
                    {"title": "Storefront", "icon": "storefront", "link": "/"},
                ],
            },
            {
                "title": "Shop",
                "separator": True,
                "items": [
                    {
                        "title": "Orders",
                        "icon": "receipt_long",
                        "link": "/admin/orders/order/",
                        "badge": "core.badges.orders_badge",
                    },
                    {"title": "Carts", "icon": "shopping_bag", "link": "/admin/orders/cart/"},
                    {"title": "Customers", "icon": "group", "link": "/admin/accounts/user/"},
                ],
            },
            {
                "title": "Inventory",
                "separator": True,
                "items": [
                    {
                        "title": "Products",
                        "icon": "local_florist",
                        "link": "/admin/catalog/product/",
                    },
                    {"title": "Categories", "icon": "category", "link": "/admin/catalog/category/"},
                    {
                        "title": "Stock movements",
                        "icon": "swap_vert",
                        "link": "/admin/inventory/stockmovement/",
                    },
                ],
            },
        ],
    },
}

LOGIN_REDIRECT_URL = "/admin/"
LOGIN_URL = "/admin/login/"
