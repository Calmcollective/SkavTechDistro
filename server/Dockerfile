# ============================================
# Skavtech Backend - Production Dockerfile
# ============================================

# Stage 1: Dependencies installation
FROM node:20-alpine3.20 AS deps

# Set working directory
WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat python3 make g++

# Copy package files for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --silent && \
    npm cache clean --force

# Stage 2: Build the application
FROM node:20-alpine3.20 AS builder

# Set working directory
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set production environment for build
ENV NODE_ENV=production

# Build the application
RUN npm run build:server

# Remove development dependencies
RUN npm prune --production && \
    npm cache clean --force

# Stage 3: Production runtime
FROM node:20-alpine3.20 AS runner

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl postgresql-client

# Create app user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Copy database migrations and seeds
COPY --from=builder --chown=nodejs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared
COPY --from=builder --chown=nodejs:nodejs /app/seed.ts ./

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Expose internal port (will be mapped by docker-compose)
EXPOSE 4000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]