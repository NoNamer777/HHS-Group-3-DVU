FROM node:24 AS build

USER node

WORKDIR /app

COPY package*.json .

RUN npm ci

ENV NODE_ENV=production

COPY . .

RUN npm run build


FROM nginx:alpine3.22

WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .

COPY .docker/default.conf /etc/nginx/conf.d/default.conf
COPY .docker/nginx.conf /etc/nginx/nginx.conf

RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /usr/share/nginx /var/cache/nginx /var/run /etc/nginx && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chmod -R 755 /usr/share/nginx /var/cache/nginx /var/run && \
    chmod -R 644 /etc/nginx/conf.d/*.conf

USER nginx

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
