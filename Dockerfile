FROM node:20-slim as build

WORKDIR /resin-frontend

ADD . .

RUN npm ci && npm run build


FROM nginx:1.27.0-alpine-slim

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /resin-frontend/build /resin-frontend
