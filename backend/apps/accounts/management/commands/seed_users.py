"""Seed demo accounts. Idempotent."""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

DEMO_USERS = [
    # email, password, first, last, is_staff
    ("staff@bloom.local", "staff12345", "Sam", "Staff", True),
    ("jane@example.com", "customer123", "Jane", "Doe", False),
    ("ravi@example.com", "customer123", "Ravi", "Patel", False),
]


class Command(BaseCommand):
    help = "Seed demo staff and customer users"

    def handle(self, *args, **options):
        created = 0
        for email, password, first, last, is_staff in DEMO_USERS:
            if User.objects.filter(email=email).exists():
                continue
            User.objects.create_user(
                email=email, password=password, first_name=first, last_name=last, is_staff=is_staff
            )
            created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new users."))
