from unittest.mock import patch

from django.http import QueryDict
from django.test import TestCase

from apps.products.models import Product
from apps.products.services import (
    WildberriesParser,
    get_product_by_id,
    get_products_with_filters,
)
from apps.products.tests.factories import ProductFactory


class ProductServiceTests(TestCase):
    def setUp(self):
        self.product1 = ProductFactory(price=500, rating=4.5, reviews_count=100)
        self.product2 = ProductFactory(price=1500, rating=3.0, reviews_count=10)
        self.product3 = ProductFactory(price=3000, rating=4.9, reviews_count=500)

    def test_get_products_with_filters_min_price(self):
        params = QueryDict('', mutable=True)
        params['min_price'] = '1000'
        products = get_products_with_filters(params)
        self.assertNotIn(self.product1, products)
        self.assertIn(self.product2, products)
        self.assertIn(self.product3, products)

    def test_get_products_with_filters_max_price(self):
        params = QueryDict('', mutable=True)
        params['max_price'] = '1000'
        products = get_products_with_filters(params)
        self.assertIn(self.product1, products)
        self.assertNotIn(self.product2, products)
        self.assertNotIn(self.product3, products)

    def test_get_products_with_filters_min_rating(self):
        params = QueryDict('', mutable=True)
        params['min_rating'] = '4.8'
        products = get_products_with_filters(params)
        self.assertIn(self.product3, products)
        self.assertNotIn(self.product1, products)
        self.assertNotIn(self.product2, products)

    def test_get_products_with_filters_min_reviews(self):
        params = QueryDict('', mutable=True)
        params['min_reviews'] = '50'
        products = get_products_with_filters(params)
        self.assertIn(self.product1, products)
        self.assertIn(self.product3, products)
        self.assertNotIn(self.product2, products)

    def test_get_products_with_ordering(self):
        params = QueryDict('ordering=-price')
        products = list(get_products_with_filters(params))
        self.assertEqual(products[0], self.product3)
        self.assertEqual(products[-1], self.product1)

    def test_get_product_by_id_success(self):
        product = get_product_by_id(self.product1.id)
        self.assertEqual(product, self.product1)

    def test_get_product_by_id_not_found(self):
        from django.http import Http404

        with self.assertRaises(Http404):
            get_product_by_id(999999)

    @patch('apps.products.services.requests.get')
    def test_wildberries_parser_fetch_and_parse(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'data': {
                'products': [
                    {
                        'name': 'Test Product',
                        'sizes': [{'price': {'basic': 10000, 'total': 8000}}],
                        'reviewRating': 4.7,
                        'feedbacks': 123,
                    }
                ]
            }
        }
        parser = WildberriesParser()
        products = parser.fetch('test')
        self.assertEqual(len(products), 1)

        parsed: dict = parser.parse(products[0])
        self.assertEqual(parsed['name'], 'Test Product')
        self.assertEqual(parsed['price'], 100.0)
        self.assertEqual(parsed['discounted_price'], 80.0)
        self.assertEqual(parsed['rating'], 4.7)
        self.assertEqual(parsed['reviews_count'], 123)

    def test_wildberries_parser_save(self):
        parser = WildberriesParser()
        product_data = {
            'name': 'Saved Product',
            'price': 100,
            'discounted_price': 90,
            'rating': 4.5,
            'reviews_count': 10,
        }
        created = parser.save(product_data)
        self.assertTrue(created)
        self.assertTrue(Product.objects.filter(name='Saved Product').exists())
