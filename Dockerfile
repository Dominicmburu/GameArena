# Multi-stage build
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Backend stage
FROM node:18-alpine

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Generate Prisma client
RUN npx prisma generate

EXPOSE 5000

CMD ["node", "server.js"]