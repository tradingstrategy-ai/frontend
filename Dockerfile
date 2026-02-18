#######################################
# Build stage
#######################################
FROM node:20.19 AS builder

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install package dependencies (cache first)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh pnpm install --frozen-lockfile

# copy remaining files
COPY . .

# Copy commercial fonts
RUN scripts/build-deps.sh

# build app
RUN pnpm run build

#######################################
# Serve stage
#######################################
FROM node:20.19-slim

WORKDIR /app

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install production dependencies only
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
RUN --mount=type=ssh pnpm install --prod --frozen-lockfile

COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts/server.js ./scripts/

# Copy root CAs (needed to run sentry-cli)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

EXPOSE 3000

# See if increase libuv thread pool size makes performance better
# The default value 4
# http://docs.libuv.org/en/v1.x/threadpool.html
ENV UV_THREADPOOL_SIZE=32

CMD ["node", "scripts/server.js"]
