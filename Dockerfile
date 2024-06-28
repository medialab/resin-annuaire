FROM nginx:1.27.0-alpine-slim

WORKDIR /resin-frontend

RUN mkdir /resin-backend

RUN apk update && \
    apk add nodejs=20.12.1-r0 npm=10.2.5-r0 && \
    apk add bash

ADD . .

RUN npm ci

RUN rm /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT ./docker-entrypoint.sh