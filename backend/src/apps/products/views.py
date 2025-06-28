from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView, Request

from apps.products.serializers import ProductSerializer
from apps.products.services import get_product_by_id, get_products_with_filters


class ProductsListAPIView(APIView):
    serializer_class = ProductSerializer

    @swagger_auto_schema(
        operation_summary='List products',
        operation_description='Get a list of products with optional filtering by price,'
        ' rating, and reviews count.',
        manual_parameters=[
            openapi.Parameter(
                'min_price',
                openapi.IN_QUERY,
                description='Minimum price',
                type=openapi.TYPE_NUMBER,
            ),
            openapi.Parameter(
                'max_price',
                openapi.IN_QUERY,
                description='Maximum price',
                type=openapi.TYPE_NUMBER,
            ),
            openapi.Parameter(
                'min_rating',
                openapi.IN_QUERY,
                description='Minimum rating',
                type=openapi.TYPE_NUMBER,
            ),
            openapi.Parameter(
                'min_reviews',
                openapi.IN_QUERY,
                description='Minimum number of reviews',
                type=openapi.TYPE_INTEGER,
            ),
            openapi.Parameter(
                'ordering',
                openapi.IN_QUERY,
                description=(
                    'Comma-separated list of fields to order by. '
                    'Allowed: price, -price, rating, -rating, reviews_count, '
                    '-reviews_count, name, -name'
                ),
                type=openapi.TYPE_STRING,
            ),
        ],
        responses={
            status.HTTP_200_OK: openapi.Response(
                description='Successfully retrieved paginated list of products',
                schema=serializer_class(many=True),
            ),
        },
    )
    def get(self, request: Request):
        products = get_products_with_filters(request.query_params)
        serializer = self.serializer_class(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProductsDetailAPIView(APIView):
    serializer_class = ProductSerializer

    @swagger_auto_schema(
        operation_summary='Retrieve product',
        operation_description='Get details of a product by its ID.',
        responses={
            status.HTTP_200_OK: openapi.Response(
                description='Successfully retrieved product details',
                schema=serializer_class(),
            ),
            status.HTTP_404_NOT_FOUND: openapi.Response(
                description='Product not found',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'detail': openapi.Schema(type=openapi.TYPE_STRING),
                    },
                ),
            ),
        },
    )
    def get(self, _: Request, id: int):
        product = get_product_by_id(id)
        serializer = self.serializer_class(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
