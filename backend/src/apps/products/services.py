import requests
from django.db.models import QuerySet
from django.shortcuts import get_object_or_404
from rest_framework.request import QueryDict

from apps.products.models import Product


def get_products_with_filters(params: QueryDict) -> QuerySet:
    """
    Filter and order products based on provided query parameters.

    Args:
        params (QueryDict): Query parameters containing filter and ordering conditions.
            Supported filters:
            - min_price: Minimum product price
            - max_price: Maximum product price
            - min_rating: Minimum product rating
            - min_reviews: Minimum number of product reviews
            Supported ordering:
            - ordering: Comma-separated list of fields to order by.
              Allowed: price, -price, rating, -rating, reviews_count,
              -reviews_count, name, -name

    Returns:
        QuerySet: Filtered and ordered product objects.
    """
    products = Product.objects.all()
    min_price = params.get('min_price')
    max_price = params.get('max_price')
    min_rating = params.get('min_rating')
    min_reviews = params.get('min_reviews')

    if min_price is not None:
        products = products.filter(price__gte=min_price)
    if max_price is not None:
        products = products.filter(price__lte=max_price)
    if min_rating is not None:
        products = products.filter(rating__gte=min_rating)
    if min_reviews is not None:
        products = products.filter(reviews_count__gte=min_reviews)

    ordering = params.get('ordering')
    allowed_fields = {
        'price',
        '-price',
        'rating',
        '-rating',
        'reviews_count',
        '-reviews_count',
        'name',
        '-name',
    }
    if ordering:
        fields = [field for field in ordering.split(',') if field in allowed_fields]
        if fields:
            products = products.order_by(*fields)
        else:
            products = products.order_by('-created_at')
    else:
        products = products.order_by('-created_at')
    return products


def get_product_by_id(product_id: int) -> Product:
    """
    Get a single product by its ID.

    Args:
        product_id (int): The ID of the product to retrieve.

    Returns:
        Product: The requested product object.

    Raises:
        Http404: If the product with the specified ID does not exist.
    """
    return get_object_or_404(Product, id=product_id)


class WildberriesParser:
    """
    A class for fetching, parsing, and saving product data from Wildberries.

    Attributes:
        API_VERSION (str): The API version for Wildberries product search.
        API_URL (str): The API endpoint for Wildberries product search.
        HEADERS (dict): HTTP headers for making requests to Wildberries API.
    """

    API_VERSION = 'v13'
    API_URL = f'https://search.wb.ru/exactmatch/ru/common/{API_VERSION}/search'
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (compatible; wb-analytics-bot/1.0)',
    }

    def fetch(self, query, page=1, limit=100) -> list:
        """
        Fetch products from Wildberries based on search query.

        Args:
            query (str): The search term to look for products.
            page (int, optional): The page number for pagination. Defaults to 1.
            limit (int, optional): Maximum number of products to return. Defaults to 100.

        Returns:
            list: A list of product dictionaries from the Wildberries API.
        """
        params = {
            'ab_testing': False,
            'appType': 1,
            'curr': 'rub',
            'dest': -1257786,
            'lang': 'ru',
            'page': page,
            'query': query,
            'resultset': 'catalog',
            'sort': 'popular',
            'limit': limit,
        }
        response = requests.get(
            self.API_URL, params=params, headers=self.HEADERS, timeout=10
        )
        response.raise_for_status()
        data = response.json()
        return data.get('data', {}).get('products', [])

    def parse(self, item) -> dict | None:
        """
        Parse product data from a Wildberries item dictionary.

        Args:
            item (dict): Product data from Wildberries API.

        Returns:
            dict: Parsed product data with standardized fields.
            None: If parsing fails.
        """
        try:
            name = item.get('name') or item.get('title') or 'Unknown'

            price = 0
            discounted_price = 0

            if 'sizes' in item and item['sizes'] and isinstance(item['sizes'], list):
                first_size = item['sizes'][0]
                if 'price' in first_size:
                    price_data = first_size['price']
                    price = (price_data.get('basic') or 0) / 100
                    discounted_price = (price_data.get('total') or 0) / 100

            rating = float(item.get('reviewRating') or 0)
            reviews_count = int(item.get('feedbacks') or 0)

            return {
                'name': name,
                'price': price,
                'discounted_price': discounted_price,
                'rating': rating,
                'reviews_count': reviews_count,
            }
        except Exception:
            return None

    def save(self, product_data) -> bool:
        """
        Save product data to the database.

        Args:
            product_data (dict): Product data to save.

        Returns:
            bool: True if a new product was created, False otherwise.
        """
        if not product_data:
            return False

        try:
            _, created = Product.objects.update_or_create(**product_data)
            return created
        except Exception:
            return False
