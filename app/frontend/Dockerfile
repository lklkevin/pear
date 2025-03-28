FROM node:20-alpine AS builder
WORKDIR /app

# Accept build-time arguments for public variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN find . -type d -name "__tests__" -exec rm -rf {} +

RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
