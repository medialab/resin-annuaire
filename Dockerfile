FROM nginx:1.27.0-alpine-slim

WORKDIR /resin-frontend

RUN mkdir /resin-backend

RUN apk update && \
    apk add nodejs=~20 npm=~10 && \
    apk add bash

ENV BACKEND_PORT=8000
ENV BACKEND_HOST=django

ADD . .

RUN npm ci

RUN rm /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/nginx.conf.template

ENTRYPOINT ./docker-entrypoint.sh
