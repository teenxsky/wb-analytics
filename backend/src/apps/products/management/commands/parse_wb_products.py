from django.core.management.base import BaseCommand

from apps.products.services import WildberriesParser


class Command(BaseCommand):
    help = 'Parse products from Wildberries by category or search query and save to DB.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--query',
            type=str,
            required=True,
            help='Search query or category for Wildberries',
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='Number of pages to parse (default: 1, ~100 products per page).',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=100,
            help='Number of products per page (default: 100).',
        )

    def handle(self, *args, **options):
        query = options['query']
        pages = options['pages']
        limit = options['limit']

        self.stdout.write(
            self.style.NOTICE(
                'Parsing Wildberries for query: '
                f"'{query}' ({pages} page(s), {limit} products per page)"
            )
        )

        parser = WildberriesParser()
        total_saved = 0
        for page in range(1, pages + 1):
            try:
                products = parser.fetch(query, page=page, limit=limit)
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Failed to fetch page {page}: {e}'))
                continue

            if not products:
                self.stdout.write(
                    self.style.WARNING(f'No products found on page {page}.')
                )
                break

            for item in products:
                product_data = parser.parse(item)
                created = parser.save(product_data)
                if created:
                    total_saved += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f'Parsed and saved {len(products)} products from page {page}.'
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f'Total new products saved: {total_saved}')
        )
