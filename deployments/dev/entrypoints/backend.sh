#!/bin/sh

poetry install
sleep 0.1

exec "$@"
