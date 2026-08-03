FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY public ./public
COPY src ./src

ARG REACT_APP_BASE_URL=/api
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/build /usr/share/nginx/html

USER 101
EXPOSE 8080

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8080/health | grep -q healthy || exit 1
