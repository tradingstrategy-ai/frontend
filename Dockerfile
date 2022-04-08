### Build Step
FROM node:16.14-alpine as builder

WORKDIR /app

# install deps first so we can cache this layer
COPY package*.json ./
RUN npm ci

# then copy the rest
COPY . .

# build theme
RUN cd theme && npm ci && npx gulp build:dist

# build app
RUN PRODUCTION=true npm run build

### Serve Step
FROM node:16.14-alpine

WORKDIR /app

# copy files from previous step
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

# our app is running on port 3000 within the container, so need to expose it
EXPOSE 3000

# the command that starts our app
CMD ["node", "build/index.js"]
