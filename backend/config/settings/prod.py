from .base import *  # noqa: F403

DEBUG = False
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
CSRF_TRUSTED_ORIGINS = [f"http://{h}" for h in ALLOWED_HOSTS] + [  # noqa: F405
    f"https://{h}"
    for h in ALLOWED_HOSTS  # noqa: F405
]
