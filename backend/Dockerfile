# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# RUN npm ci --only=production
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Expose the port your app runs on (change if needed)
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]