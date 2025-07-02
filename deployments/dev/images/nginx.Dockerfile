FROM nginx:1.27.5-alpine

ENV BASE_LOCAL_PATH="./deployments/dev"

COPY $BASE_LOCAL_PATH/conf/nginx.conf /etc/nginx/templates/default.conf.template
