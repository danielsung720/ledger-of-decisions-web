# ============================================
# Development Stage
# ============================================
FROM node:22-alpine AS development

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Build Stage
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

# Build arguments for proxy configuration
ARG NUXT_API_PROXY_TARGET=http://localhost:8080
ENV NUXT_API_PROXY_TARGET=${NUXT_API_PROXY_TARGET}

# Build the application
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:22-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
    adduser -u 1001 -G nodejs -s /bin/sh -D nuxtjs

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

USER nuxtjs

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
