FROM python:3.13-alpine

# Local project paths
ENV LOCAL_BACKEND_PATH='/backend'
ENV LOCAL_DEPLOYMENT_PATH='/deployments/dev'

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

RUN python -m pip install --no-cache-dir poetry==$POETRY_VERSION \
    && poetry self add poetry-plugin-shell

COPY $LOCAL_DEPLOYMENT_PATH/entrypoints/backend.sh /backend.sh
RUN chmod +x /backend.sh
ENTRYPOINT ["/backend.sh"]
