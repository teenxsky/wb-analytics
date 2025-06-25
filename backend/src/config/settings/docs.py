"""
Swagger documentation settings for wb-analytics project.
"""

SWAGGER_SETTINGS = {
    'USE_SESSION_AUTH': False,
    'DEFAULT_MODEL_RENDERING': 'example',
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
        },
    },
    'SECURITY_REQUIREMENTS': None,
}
