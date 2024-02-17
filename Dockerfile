#######################################
# Build stage
#######################################
FROM node:20.11 as builder

WORKDIR /app

# install npm dependencies (cache first)
COPY package*.json ./
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh npm ci

# copy remaining files
COPY . .

# Copy commercial fonts
RUN scripts/build-deps.sh

# build app
RUN npm run build

#######################################
# Serve stage
#######################################
FROM node:20.11-slim

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
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
