# ---- Build Stage ----
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Disable telemetry
# RUN bunx next telemetry disable
# 
# # Build the Next.js app
# RUN bun run build

# ---- Runtime Stage ----
FROM oven/bun:1-alpine AS runner

WORKDIR /app

# Copy production artifacts from builder
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start Next.js app using "next start"
CMD ["bun", "run", "dev"]
