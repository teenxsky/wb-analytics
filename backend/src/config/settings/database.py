"""
Database settings for wb-analytics project.
"""

import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('DOCKER_POSTGRES_HOST'),
        'PORT': os.getenv('DOCKER_POSTGRES_PORT'),
    }
}
