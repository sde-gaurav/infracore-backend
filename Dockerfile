# =========================================================
# Stage 1: Install dependencies
# =========================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production dependencies in this layer
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# =========================================================
# Stage 2: Build / prepare application
# =========================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .

# =========================================================
# Stage 3: Production image
# =========================================================
FROM node:20-alpine AS production

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

WORKDIR /app

# Copy production deps from deps stage
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source
COPY --chown=nodeuser:nodejs . .

# Create required runtime directories
RUN mkdir -p src/logs src/uploads && chown -R nodeuser:nodejs src/logs src/uploads

USER nodeuser

EXPOSE 5000

ENV NODE_ENV=production

# dumb-init properly forwards POSIX signals to the Node.js process
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1
