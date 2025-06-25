"""
Security settings for wb-analytics project.
"""

import os

from corsheaders.defaults import (
    default_headers,
)

FRONTEND_URL = f'http://{os.getenv("FRONTEND_BASE")}'

CSRF_TRUSTED_ORIGINS = [FRONTEND_URL]
CORS_ALLOWED_ORIGINS = [FRONTEND_URL]
CORS_ALLOW_HEADERS = list(default_headers)
