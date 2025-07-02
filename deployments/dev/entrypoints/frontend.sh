#!/bin/sh

bun install
sleep 0.1

exec "$@"
