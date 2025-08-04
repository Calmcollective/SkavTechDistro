# Stage 1: Build the server
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build:server

# Stage 2: Setup production dependencies
FROM node:18-alpine AS production-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Stage 3: Create the final production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules
EXPOSE 5000
CMD ["npm", "start"]