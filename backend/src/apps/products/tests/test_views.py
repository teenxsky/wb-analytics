from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.tests.factories import ProductFactory


class ProductsListAPIViewTests(APITestCase):
    def setUp(self):
        self.product1 = ProductFactory(price=500, rating=4.5, reviews_count=100)
        self.product2 = ProductFactory(price=1500, rating=3.0, reviews_count=10)
        self.product3 = ProductFactory(price=3000, rating=4.9, reviews_count=500)
        self.url = reverse('product-list-create')

    def test_list_products_basic(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 3)

        for item in response.data:
            self.assertIn('id', item)
            self.assertIn('name', item)
            self.assertIn('price', item)
            self.assertIn('discounted_price', item)
            self.assertIn('rating', item)
            self.assertIn('reviews_count', item)
            self.assertIn('created_at', item)

    def test_list_products_with_min_price_filter(self):
        response = self.client.get(self.url, {'min_price': 1000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for item in response.data:
            self.assertGreaterEqual(float(item['price']), 1000)

    def test_list_products_with_max_price_filter(self):
        response = self.client.get(self.url, {'max_price': 1000})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for item in response.data:
            self.assertLessEqual(float(item['price']), 1000)

    def test_list_products_with_min_rating_filter(self):
        response = self.client.get(self.url, {'min_rating': 4.8})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for item in response.data:
            self.assertGreaterEqual(float(item['rating']), 4.8)

    def test_list_products_with_min_reviews_filter(self):
        response = self.client.get(self.url, {'min_reviews': 50})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for item in response.data:
            self.assertGreaterEqual(int(item['reviews_count']), 50)

    def test_list_products_with_ordering(self):
        response = self.client.get(self.url, {'ordering': '-price'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        prices = [float(item['price']) for item in response.data]
        self.assertEqual(prices, sorted(prices, reverse=True))


class ProductsDetailAPIViewTests(APITestCase):
    def setUp(self):
        self.product = ProductFactory()

    def test_retrieve_product_success(self):
        url = reverse('product-detail', args=[self.product.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('id', response.data)
        self.assertIn('name', response.data)
        self.assertIn('price', response.data)
        self.assertIn('discounted_price', response.data)
        self.assertIn('rating', response.data)
        self.assertIn('reviews_count', response.data)
        self.assertIn('created_at', response.data)
        self.assertEqual(response.data['name'], self.product.name)

    def test_retrieve_product_not_found(self):
        url = reverse('product-detail', args=[999999])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
