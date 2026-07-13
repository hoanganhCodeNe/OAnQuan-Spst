# Base node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency catalogs
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/
COPY database/ ./database/

# Build TypeScript code
RUN npm run build

# Expose server port
EXPOSE 5000

# Environment defaults
ENV PORT=5000
ENV NODE_ENV=production

# Start command
CMD ["npm", "start"]
