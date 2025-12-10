# DevOps Intelligence Platform - Docker Configuration
# Multi-stage build for optimal production deployment

# Stage 1: Base Python environment for Kestra scripts
FROM python:3.11-slim as python-base

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python scripts
COPY kestra/scripts/ ./kestra/scripts/

# Stage 2: Node.js environment for dashboard
FROM node:18-alpine as node-base

WORKDIR /app/dashboard

# Install dependencies
COPY dashboard/package*.json ./
RUN npm ci --only=production

# Copy dashboard source
COPY dashboard/ ./

# Build the application
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine as production

WORKDIR /app

# Install Python for Kestra scripts
RUN apk add --no-cache python3 py3-pip

# Copy Python environment
COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /app/kestra ./kestra

# Copy built dashboard
COPY --from=node-base /app/dashboard/.next ./dashboard/.next
COPY --from=node-base /app/dashboard/public ./dashboard/public
COPY --from=node-base /app/dashboard/package*.json ./dashboard/
COPY --from=node-base /app/dashboard/node_modules ./dashboard/node_modules

# Copy configuration files
COPY vercel.json ./
COPY env.example ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start", "--prefix", "dashboard"]
