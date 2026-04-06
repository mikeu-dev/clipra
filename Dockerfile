# Build Stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set dummy env for build
ENV DATABASE_URL="mysql://build:build@localhost:3306/build"
ENV SMTP_HOST="localhost"
ENV SMTP_USER="user"
ENV SMTP_PASS="pass"

# Build application
RUN bun run build

# Run Stage
FROM oven/bun:1

WORKDIR /app

# Copy built assets and production dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port (default SvelteKit node adapter port)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start application
USER bun
CMD ["bun", "build/index.js"]
