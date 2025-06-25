from django.urls import path

from config.yasg import docs_schema_view_v1

__all__ = ['urlpatterns']

apps_patterns_v1 = []

third_party_patterns_v1 = [
    path(
        'docs/',
        docs_schema_view_v1.with_ui('swagger', cache_timeout=0),
        name='docs-ui-v1',
    ),
    path(
        'docs<format>/',
        docs_schema_view_v1.without_ui(cache_timeout=0),
        name='docs-file-v1',
    ),
]

urlpatterns = [
    *apps_patterns_v1,
    *third_party_patterns_v1,
]
