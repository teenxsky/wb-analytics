FROM oven/bun:1.2-alpine AS build-stage

ARG NEXT_PUBLIC_API_URL

WORKDIR /frontend
COPY ./frontend/package.json .
COPY ./frontend/bun.lock .

RUN bun install
COPY ./frontend .
RUN bun run build

FROM nginx:1.27.5-alpine AS production-stage

ENV BASE_LOCAL_PATH="./deployments/prod"

RUN rm /etc/nginx/conf.d/default.conf
COPY $BASE_LOCAL_PATH/conf/nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build-stage /frontend/out /usr/share/nginx/html
