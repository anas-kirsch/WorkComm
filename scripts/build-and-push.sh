#!/usr/bin/env bash
set -euo pipefail

# Build & push backend + frontend images with tag management.
# Usage examples:
#   ./scripts/build-and-push.sh                # uses default TAG (git sha or date)
#   TAG=v1 ./scripts/build-and-push.sh         # custom tag
#   REGISTRY=ghcr.io/anas-kirsch ./scripts/build-and-push.sh
#
# Outputs a file .env.images containing BACKEND_IMAGE and FRONTEND_IMAGE you can source:
#   set -a; . ./.env.images; set +a
#   docker compose -f docker-compose.prod.yml up -d

REGISTRY="${REGISTRY:-docker.io}"
NAMESPACE="${NAMESPACE:-$USER}" # dockerhub user or org
APP_NAME="workcomm"
TAG="${TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M)}"

BACKEND_IMAGE="$REGISTRY/$NAMESPACE/${APP_NAME}-backend:$TAG"
FRONTEND_IMAGE="$REGISTRY/$NAMESPACE/${APP_NAME}-frontend:$TAG"

# Build args for frontend (bake endpoints)
API_URL_ARG=${API_URL:-http://backend:4900}
GROUP_SOCKET_URL_ARG=${GROUP_SOCKET_URL:-http://backend:9000}
PRIVATE_SOCKET_URL_ARG=${PRIVATE_SOCKET_URL:-http://backend:10100}
STRIPE_PUBLIC_KEY_ARG=${STRIPE_PUBLIC_KEY:-pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx}

echo "Building images with tag: $TAG"

docker build -t "$BACKEND_IMAGE" ./backend

docker build \
  --build-arg API_URL="$API_URL_ARG" \
  --build-arg GROUP_SOCKET_URL="$GROUP_SOCKET_URL_ARG" \
  --build-arg PRIVATE_SOCKET_URL="$PRIVATE_SOCKET_URL_ARG" \
  --build-arg STRIPE_PUBLIC_KEY="$STRIPE_PUBLIC_KEY_ARG" \
  -t "$FRONTEND_IMAGE" ./frontend

# Push
echo "Pushing $BACKEND_IMAGE"
docker push "$BACKEND_IMAGE"

echo "Pushing $FRONTEND_IMAGE"
docker push "$FRONTEND_IMAGE"

# Write environment file for compose.prod
cat > .env.images <<EOF
BACKEND_IMAGE=$BACKEND_IMAGE
FRONTEND_IMAGE=$FRONTEND_IMAGE
EOF

echo "Generated .env.images:" && cat .env.images

echo "Done. Deploy with:"
echo "  set -a; . ./.env.images; set +a" 
echo "  docker compose -f docker-compose.prod.yml up -d"
