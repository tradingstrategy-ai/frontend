#######################################
# Build stage
#######################################
FROM node:18.14 as builder

ARG FONT_ZIP_DOWNLOAD_URL
ENV FONT_ZIP_DOWNLOAD_URL=$FONT_ZIP_DOWNLOAD_URL

WORKDIR /app

# install trade-executor-frontend (cache first)
COPY deps/trade-executor-frontend ./deps/trade-executor-frontend
RUN (cd deps/trade-executor-frontend && npm ci)

# install npm dependencies (cache second)
COPY package*.json ./
RUN mkdir -p -m 0600 ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh npm ci

# copy remaining files
COPY . .

# Fetch commercial fonts
RUN scripts/fetch-fonts.sh

# build app
RUN npm run build

#######################################
# Serve stage
#######################################
FROM node:18.14-slim

WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts/server.js ./scripts/

EXPOSE 3000

# See if increase libuv thread pool size makes performance better
# The default value 4
# http://docs.libuv.org/en/v1.x/threadpool.html
ENV UV_THREADPOOL_SIZE=32

CMD ["node", "scripts/server.js"]
