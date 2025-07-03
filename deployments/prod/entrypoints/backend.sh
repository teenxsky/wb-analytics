#!/bin/sh

poetry run python src/manage.py migrate
poetry run python src/manage.py collectstatic --no-input

exec "$@"
