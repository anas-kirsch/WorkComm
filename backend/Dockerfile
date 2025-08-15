# Production-ready Dockerfile for backend service
# 1. Use lightweight Node image
FROM node:20-alpine AS base

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Install system dependencies (if bcrypt needs build tools)
# We install python3 and build-base only in a build stage to keep final image slim
FROM base AS deps
RUN apk add --no-cache python3 make g++

# 4. Copy manifest files first for better layer caching
COPY package.json ./
COPY package-lock.json* ./
COPY .npmrc* ./

# 5. Install production dependencies
RUN npm install --omit=dev

# 6. Copy application source
COPY src ./src
COPY public ./public

# 7. Ports (API + sockets). Les valeurs réelles viennent du fichier .env au run.
# Fallbacks possibles définis dans le code (API) ou à fournir via --env-file.
ENV PRIVATE_SOCKET_PORT=10100 \
  GROUP_SOCKET_PORT=9000

# Documentation expose (facultatif mais aide lisibilité)
EXPOSE 4900 10100 9000

# 8. Healthcheck (simple TCP attempt)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e 'const p=process.env.BACKEND_PORT||4900; fetch("http://127.0.0.1:"+p+"/api/nav/ping").then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))' || exit 1

# 9. Run the application
CMD ["npm", "start"]

# Documentation:
# Build: docker build -t workcomm-backend ./backend
# Run (API + sockets): docker run --env-file backend/.env -p 4900:4900 -p 10100:10100 -p 9000:9000 workcomm-backend
# Variables requises: BACKEND_PORT, PRIVATE_SOCKET_PORT, GROUP_SOCKET_PORT, DATABASE_URL, FRONTEND_URL, PC_LOCAL_URL, LOCALHOST_URL, JWT_SECRET, STRIPE_KEY, STRIPE_WEBHOOK_SECRET...
