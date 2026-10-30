#!/bin/bash
export NS=$(cat /etc/resolv.conf | grep nameserver | awk -F " " '{print $2}')

envsubst '\$NS \$BACKEND_HOST \$BACKEND_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

sleep 5
npm run build

nginx -g "daemon off;"
