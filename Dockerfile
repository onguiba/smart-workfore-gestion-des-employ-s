# ============================================================
# TSA SmartWorkforce AI™ — Dockerfile (Production)
# Transport & Services d'Afrique — Système RH & Biométrique
# ============================================================

# ─── Stage 1: Builder ───────────────────────────────────────
FROM node:20-alpine AS builder

LABEL maintainer="TSA — Transport & Services d'Afrique"
LABEL description="SmartWorkforce AI — Portail RH, Pointage Biométrique & Suivi Flotte"

WORKDIR /app

# Install only production dependencies
COPY backend/package.json ./backend/package.json
RUN cd backend && npm install --omit=dev --no-audit --no-fund

# ─── Stage 2: Production Runner ─────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -g 1001 -S tsaapp && \
    adduser  -u 1001 -S tsaapp -G tsaapp

WORKDIR /app

# Copy backend (server + node_modules from builder)
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/server.js ./backend/server.js
COPY backend/package.json ./backend/package.json

# Copy frontend (all HTML/CSS/JS static files)
COPY frontend/ ./frontend/

# Copy data directory if present (JSON fallback DB)
# This is optional — will be replaced by mounted volume in production
RUN mkdir -p ./data

# Copy environment example (real .env injected at runtime via Docker secret/env)
COPY .env.example .env.example

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose application port
EXPOSE 3000

# Health check — verifies the server responds on /api/employees
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3000/api/employees || exit 1

# Run as non-root
USER tsaapp

# Start the application
CMD ["node", "backend/server.js"]
