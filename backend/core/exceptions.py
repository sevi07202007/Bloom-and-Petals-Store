"""Domain exceptions and a DRF handler that maps them to HTTP responses."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


class DomainError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid request."

    def __init__(self, detail=None, **extra):
        self.detail = detail or self.default_detail
        self.extra = extra
        super().__init__(self.detail)


class InsufficientStock(DomainError):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Insufficient stock."


class InvalidOrderState(DomainError):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Order is not in a valid state for this action."


def exception_handler(exc, context):
    if isinstance(exc, DomainError):
        return Response({"detail": exc.detail, **exc.extra}, status=exc.status_code)
    return drf_exception_handler(exc, context)
