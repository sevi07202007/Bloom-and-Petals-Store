import pytest

pytestmark = pytest.mark.django_db


def test_register_then_me(api_client):
    resp = api_client.post(
        "/api/auth/register/",
        {
            "email": "new@example.com",
            "password": "strong-pass-123",
            "first_name": "N",
            "last_name": "U",
        },
        format="json",
    )
    assert resp.status_code == 201
    assert "access" in resp.data and "refresh" in resp.data

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
    me = api_client.get("/api/auth/me/")
    assert me.status_code == 200
    assert me.data["email"] == "new@example.com"


def test_token_login(api_client, user):
    resp = api_client.post(
        "/api/auth/token/", {"email": user.email, "password": "pass12345"}, format="json"
    )
    assert resp.status_code == 200
    assert "access" in resp.data


def test_me_requires_auth(api_client):
    assert api_client.get("/api/auth/me/").status_code == 401
