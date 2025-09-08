# ============================================
# Skavtech Frontend - Production Dockerfile
# ============================================

# Stage 1: Build the React application
FROM node:20-alpine3.20 AS builder

# Set working directory
WORKDIR /app

# Update packages and install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache git

# Copy package files for better caching
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --silent && \
    npm cache clean --force

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Build the client application
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# Stage 2: Production runtime with Nginx
FROM nginx:1.28-alpine-slim

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache curl

# Create nginx user and directories
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY ../docker/nginx.conf /etc/nginx/conf.d/default.conf

# Create log directory
RUN mkdir -p /var/log/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/cache/nginx

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expose port 80 (internal - will be mapped by docker-compose)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
