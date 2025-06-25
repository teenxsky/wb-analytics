from django.contrib import admin
from django.urls import include, path

from config.urls.v1 import urlpatterns as v1_urls

__all__ = ['urlpatterns']

API_V1_URL_PREFIX = 'v1/'

urlpatterns = [
    path('admin/', admin.site.urls),
    path(API_V1_URL_PREFIX, include(v1_urls)),
]
