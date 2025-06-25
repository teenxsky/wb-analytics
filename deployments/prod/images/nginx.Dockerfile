FROM nginx:1.27.5-alpine

ENV BASE_LOCAL_PATH="./deployments/prod"

COPY $BASE_LOCAL_PATH/conf/nginx.conf /etc/nginx/templates/default.conf.template

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
  && ln -sf /dev/stderr /var/log/nginx/error.log
