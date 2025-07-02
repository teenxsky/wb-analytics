FROM oven/bun:1.2-alpine

WORKDIR /frontend
ENV LOCAL_DEPLOYMENT_PATH='/deployments/dev'

COPY $LOCAL_DEPLOYMENT_PATH/entrypoints/frontend.sh /frontend.sh
RUN chmod +x /frontend.sh
ENTRYPOINT ["/frontend.sh"]
