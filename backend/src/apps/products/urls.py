from django.urls import path

from apps.products.views import ProductsDetailAPIView, ProductsListAPIView

urlpatterns = [
    path(
        'products/',
        ProductsListAPIView.as_view(),
        name='product-list-create',
    ),
    path(
        'products/<int:id>/',
        ProductsDetailAPIView.as_view(),
        name='product-detail',
    ),
]
