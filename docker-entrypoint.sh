#!/bin/bash
export NS=$(cat /etc/resolv.conf | grep nameserver | awk -F " " '{print $2}')

envsubst '\$NS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

npm run build

nginx -g "daemon off;"