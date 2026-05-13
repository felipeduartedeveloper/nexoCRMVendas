# ============================================================================
# crmvendas backend — NestJS + Bun
# ============================================================================
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app
COPY package.json ./
RUN bun install

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN bun run build

# ---- runtime ----
FROM oven/bun:1.1-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN mkdir -p /app/uploads

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "dist/main.js"]
