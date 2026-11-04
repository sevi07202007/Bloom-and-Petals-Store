"""Seed demo categories and products. Idempotent: safe to run repeatedly."""

from decimal import Decimal
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.catalog.models import Category, Product, ProductImage
from apps.inventory.models import StockMovement
from apps.inventory.services import adjust_stock

CATALOG = {
    "Roses": [
        (
            "Classic Red Roses (12)",
            "49.00",
            25,
            "A dozen long-stem red roses, hand-tied with eucalyptus.",
        ),
        ("Blush Pink Roses (12)", "47.00", 18, "Soft pink roses for gentle celebrations."),
        ("White Rose Bouquet", "45.00", 12, "Pure white roses wrapped in kraft paper."),
        ("Garden Rose Mix", "58.00", 8, "Fragrant garden roses in mixed warm tones."),
    ],
    "Seasonal Bouquets": [
        ("Spring Meadow", "42.00", 20, "Tulips, ranunculus and daffodils in a bright arrangement."),
        ("Summer Sunshine", "44.00", 15, "Sunflowers, zinnias and solidago."),
        ("Autumn Ember", "46.00", 10, "Dahlias, chrysanthemums and seeded eucalyptus."),
        ("Winter Frost", "52.00", 6, "White lilies, silver brunia and pine."),
    ],
    "Tulips": [
        ("Rainbow Tulips (20)", "32.00", 30, "Twenty mixed-colour Dutch tulips."),
        ("Parrot Tulips (15)", "38.00", 9, "Ruffled parrot tulips in deep purple and coral."),
        (
            "Candy Cane Tulips (20)",
            "34.00",
            14,
            "Red-and-white striped Dutch tulips, cheerful as a sweet shop.",
        ),
    ],
    "Plants": [
        ("Peace Lily", "28.00", 11, "Low-light tolerant indoor plant in a ceramic pot."),
        ("Monstera Deliciosa", "45.00", 5, "Statement plant with iconic split leaves."),
        ("Lavender Pot", "18.00", 22, "Fragrant English lavender in a terracotta pot."),
        ("Orchid (Phalaenopsis)", "36.00", 3, "Double-stem white orchid."),
    ],
    "Occasions": [
        ("Birthday Brights", "40.00", 16, "Gerberas, roses and carnations in vivid colours."),
        ("Sympathy Whites", "65.00", 7, "Lilies, roses and chrysanthemums in white."),
        ("New Baby Pastels", "48.00", 10, "Soft pastel mix with a mini balloon."),
        ("Anniversary Luxe", "85.00", 4, "Premium roses, peonies and hydrangea."),
        ("Thank You Posy", "26.00", 0, "A small hand-tied posy. Currently out of stock."),
    ],
}


IMAGES_DIR = Path(__file__).resolve().parents[2] / "fixtures" / "images"


def attach_image(product: Product) -> bool:
    """Attach the bundled fixture photo (CC-licensed, see fixtures/images/CREDITS.json)."""
    src = IMAGES_DIR / f"{product.slug}.jpg"
    if not src.exists() or product.images.exists():
        return False
    with src.open("rb") as fh:
        ProductImage.objects.create(
            product=product,
            image=File(fh, name=src.name),
            alt_text=product.name,
            is_primary=True,
        )
    return True


class Command(BaseCommand):
    help = "Seed demo catalog data"

    def handle(self, *args, **options):
        created = 0
        for order, (cat_name, products) in enumerate(CATALOG.items()):
            category, _ = Category.objects.get_or_create(
                slug=slugify(cat_name), defaults={"name": cat_name, "sort_order": order}
            )
            for name, price, stock, description in products:
                slug = slugify(name)
                product, was_created = Product.objects.get_or_create(
                    slug=slug,
                    defaults={
                        "name": name,
                        "sku": f"BP-{slug[:20].upper()}",
                        "category": category,
                        "price": Decimal(price),
                        "description": description,
                    },
                )
                attach_image(product)
                if was_created:
                    created += 1
                    if stock:
                        adjust_stock(
                            product.pk, stock, StockMovement.Reason.RESTOCK, note="Initial seed"
                        )
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new products."))
