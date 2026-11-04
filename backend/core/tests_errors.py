import pytest
from django.test import override_settings

pytestmark = pytest.mark.django_db


@override_settings(DEBUG=False)
def test_html_404_uses_branded_template(client):
    resp = client.get("/no-such-page/")
    assert resp.status_code == 404
    assert b"This page has wilted" in resp.content


@override_settings(DEBUG=False)
def test_api_404_stays_json(client):
    resp = client.get("/api/no-such-endpoint/")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Not found."


def test_403_template_renders(client):
    from django.template.loader import render_to_string

    html = render_to_string("403.html")
    assert "This garden is staff only" in html


def test_500_template_renders():
    from django.template.loader import render_to_string

    html = render_to_string("500.html")
    assert "We dropped the vase" in html


@override_settings(DEBUG=False)
def test_admin_404_for_staff_uses_admin_shell(client, staff_user):
    client.force_login(staff_user)
    resp = client.get("/admin/no-such-model/")
    assert resp.status_code == 404
    assert b"This page has wilted" in resp.content
    assert b"Search apps and models" in resp.content  # sidebar present


@override_settings(DEBUG=False)
def test_admin_unknown_url_for_anonymous_redirects_to_login(client):
    resp = client.get("/admin/no-such-model/")
    assert resp.status_code == 302
    assert resp.url.startswith("/admin/login/")


def test_root_redirects(client, settings):
    settings.DEBUG = True
    assert client.get("/").url == settings.FRONTEND_URL
    settings.DEBUG = False
    assert client.get("/").url == "/admin/"
