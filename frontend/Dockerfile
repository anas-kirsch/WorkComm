## Frontend (Angular) production image
# Multi-stage: build with Node, serve with Nginx

FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
# Lockfile est désynchronisé (dotenv ajouté). Utilisation temporaire de npm install.
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy scripts
COPY scripts ./scripts

# NOTE: .env is intentionally NOT copied (it's in .dockerignore) to avoid embedding secrets by accident.
# The build script will fallback to default values if env vars are not provided.
# To inject custom values WITHOUT copying .env, pass build args, e.g.:
#   docker build --build-arg API_URL=http://localhost:4900 -t workcomm-frontend .
# Then we export them so prepare-env.mjs can read them.
ARG API_URL
ARG GROUP_SOCKET_URL
ARG PRIVATE_SOCKET_URL
ARG STRIPE_PUBLIC_KEY
ENV API_URL=$API_URL \
  GROUP_SOCKET_URL=$GROUP_SOCKET_URL \
  PRIVATE_SOCKET_URL=$PRIVATE_SOCKET_URL \
  STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY

# Copy source
COPY angular.json tsconfig*.json ./
COPY src ./src
COPY public ./public

# Generate Angular environment files from .env then build
RUN npm run build:docker

FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built app (Angular 20 builder outputs to dist/<name>/browser by default)
COPY --from=build /app/dist/frontend/browser ./

# Custom nginx config to handle SPA routing (fallback to index.html)
COPY scripts/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
