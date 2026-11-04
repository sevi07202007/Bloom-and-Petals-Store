"""Run all seeders in dependency order: users -> catalog -> orders."""

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed all demo data (users, catalog, orders)"

    def add_arguments(self, parser):
        parser.add_argument("--no-orders", action="store_true", help="Skip demo orders")

    def handle(self, *args, **options):
        call_command("seed_users")
        call_command("seed_catalog")
        if not options["no_orders"]:
            call_command("seed_orders")
        self.stdout.write(self.style.SUCCESS("All seeders complete."))
