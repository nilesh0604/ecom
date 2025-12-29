# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client for the container's platform
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 3000

# Development command
CMD ["npm", "run", "dev"]
