FROM python:3.13-alpine

# Local project paths
ENV LOCAL_BACKEND_PATH='./backend'
ENV LOCAL_ENTRYPOINTS_PATH='./deployments/prod/entrypoints'

# Python
ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random

# PIP
ENV PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100

# Poetry
ENV POETRY_VERSION=2.1.3 \
  POETRY_VIRTUALENVS_CREATE=true


RUN apk update && \
  apk add --no-cache \
  build-base \
  gettext \
  libpq-dev \
  wget \
  && apk del build-base


WORKDIR /backend

RUN python -m pip install --no-cache-dir poetry==$POETRY_VERSION
RUN poetry config virtualenvs.in-project ${POETRY_VIRTUALENVS_CREATE}

COPY ${LOCAL_BACKEND_PATH}/pyproject.toml .
COPY ${LOCAL_BACKEND_PATH}/poetry.lock .
RUN poetry install --no-interaction --no-cache

COPY ${LOCAL_BACKEND_PATH}/ .
COPY ${LOCAL_ENTRYPOINTS_PATH}/backend.sh .

RUN chmod +x /backend/backend.sh

RUN mkdir -p /backend/src/staticfiles

RUN addgroup --system app && adduser --system --ingroup app app
RUN chown -R app:app /backend
RUN chown -R app:app /backend/src/staticfiles
USER app

ENTRYPOINT ["/backend/backend.sh"]
