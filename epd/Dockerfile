FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma.config.ts ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma

# Copy source code
COPY backend ./backend

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

# Run in dev mode with ts-node-dev
CMD ["npm", "run", "dev"]
