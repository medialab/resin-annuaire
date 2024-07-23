FROM nginx:1.27.0-alpine-slim

WORKDIR /resin-frontend

RUN mkdir /resin-backend

RUN apk update && \
    apk add nodejs=20.12.1-r0 npm=10.2.5-r0 && \
    apk add bash && \
    apk add at

ENV BACKEND_PORT=8000
ENV BACKEND_HOST=django

ADD . .

RUN npm ci

RUN rm /etc/nginx/nginx.conf

COPY nginx.conf /etc/nginx/nginx.conf.template

ENTRYPOINT ./docker-entrypoint.sh
