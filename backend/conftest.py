import pytest
from rest_framework.test import APIClient

from tests.factories import CategoryFactory, ProductFactory, UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return UserFactory()


@pytest.fixture
def staff_user(db):
    return UserFactory(is_staff=True)


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user)
    return api_client


@pytest.fixture
def staff_client(api_client, staff_user):
    api_client.force_authenticate(staff_user)
    return api_client


@pytest.fixture
def category(db):
    return CategoryFactory()


@pytest.fixture
def product(category):
    return ProductFactory(category=category, stock_quantity=10)
