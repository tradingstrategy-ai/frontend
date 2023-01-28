# Running frontend SvelteKit app as Docker container

The SvelteKit is run in a docker container.

### Creating a new release

To build and tag a new Docker image jstjust run the shortcut script locally:

```shell
bash scripts/release.sh
```

## Production

### Building the container

- GHCR (Github registry) is used to store frontend images
- The container is build in [javascript.yml](../.github/workflows/javascript.yml) and uploaded to Github registry.
- The container is published on Github registry ghcr.io based on pull request id or version tag
- Example container names that can be accepted by `docker` or `docker-compose`
  - `ghcr.io/tradingstrategy-ai/frontend:pr-58`
  - `ghcr.io/tradingstrategy-ai/frontend:v1.0.1`

### Viewing the running container

View the running containerr and its environment.

```shell
ssh $PROD
cd ~/frontend
docker-compose ps
```

Should produce:

```
NAME                COMMAND                  SERVICE             STATUS              PORTS
frontend            "docker-entrypoint.s…"   frontend            running             127.0.0.1:3000->3000/tcp
```

To view the the currently running version tag:

```shell
docker inspect frontend|grep -i version
```

Should produce:

```
"TS_PUBLIC_FRONTEND_VERSION_TAG=v4",
"NODE_VERSION=16.15.1",
"YARN_VERSION=1.22.19"
"com.docker.compose.version": "2.5.0",
"org.opencontainers.image.version": "v4"
```

### Viewing frontend logs

```shell
ssh $PROD
cd ~/frontend
docker-compose logs frontend
```

### Creating a production tag

Check out the `master` branch locally.

Then run [../scripts/release.bash](release.bash).

#### Creating production tag manually

Any tag starting with `v` is consired a production tag.
[You can view existing tags here](https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend).

Production tags are a sequential series of versions:

- `v1`
- `v2`
- ...
- `v23`

Tag the image for production run with the following one-liner:

```shell
TAG=v4 ; git tag $TAG ; git push origin $TAG
```

- [Check that the build completes on Github Actions](https://github.com/tradingstrategy-ai/frontend/actions)
- [Check container releases on org level](https://github.com/orgs/tradingstrategy-ai/packages)

### Updating the production server

Sync `docker-compose.yml` to the server (only if yml updates needed):

```shell
scp docker-compose.yml $PROD:./frontend
```

The run:

```shell
ssh $PROD
cd frontend

# Reads GHCR token and other secrets from this file
source ~/secrets.env

# Choose the version to run in the production
export TS_PUBLIC_FRONTEND_VERSION_TAG=v48

# Restart production with a new version
docker-compose up -d
```

Check logs that the node-adapter starts properly:

```shell
docker-compose logs
```

Then visit the [diagnostics page](https://tradingstrategy.ai/diagnostics) to see the version tag has been updated.

## Local containers

### Creating PAT to access Github container registry

- Go to [Personal tokens](https://github.com/settings/tokens) in Github Developer settings.
- Generate new token
- Save the token in the password manager
- Select the read:packages scope to download container images and read their metadata.
- Select the write:packages scope to download and upload container images and read and write their metadata.
- Select the delete:packages scope to delete container images.

### Running the container locally

Login to the ghcr using your Github username and access token as a password:

```shell
docker login ghcr.io -u miohtama
```

Then pull any image using its pull request number:

```shell
docker pull ghcr.io/tradingstrategy-ai/frontend:pr-58
```

Run it with your environment variables:

```shell
# Assume locally run backend, see backend/docs/local-staging.md
export TS_PUBLIC_SITE_MODE=production
export TS_PUBLIC_BACKEND_INTERNAL_URL=http://host.docker.internal:3456/api
# On an M1/M2 mac, add `--platform linux/amd64` option to below command
docker run --env-file .env -e TS_PUBLIC_SITE_MODE -e TS_PUBLIC_BACKEND_INTERNAL_URL \
  -p 3000:3000 ghcr.io/tradingstrategy-ai/frontend:pr-58
```

Then visit [http://localhost:3000/](http://localhost:3000/).

## Running the container on production

You can run the latest frontend on the production server with:

```shell
docker login ghcr.io -u miohtama  # Password is your PAT, see above
export FRONTEND_PRODUCTION_TAG=v1 # replace with appropriate tag
docker-compose up -d
```

This will fetch the latest version and restart the frontend.

Then visit [http://localhost:3000](http://localhost:3000).

### Listing available tags for a container on ghcr.io

[You can view releases on Packages section of your project on Github](https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend).

#### Machine readable way

[See this post how to list the tags in ghcr.io](https://github.community/t/how-to-check-if-a-container-image-exists-on-ghcr/154836/6).

```shell
echo $GITHUB_TOKEN
```

Should give your PAT token that looks lke:

```
ghp_mmc...
```

```shell
export GHCR_TOKEN=$(echo $GITHUB_TOKEN | base64)
```

To list tags

```
curl -H "Authorization: Bearer $GHCR_TOKEN" https://ghcr.io/v2/tradingstrategy-ai/frontend/tags/list
```

You should get a JSON reply like:

```
{"name":"tradingstrategy-ai/frontend","tags":["pr-58"]}
```

## More information

- [Learn about GHCR](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry)

- [GHCR recipes](https://nira.com/github-container-registry/)

## Troubleshooting

### Testing the Linux host gateway (host.docker.internal)

Bash in the container with the host gateway enabled:

```shell
docker run \
  -ti \
  --entrypoint /bin/bash \
  --add-host=host.docker.internal:host-gateway \
  ghcr.io/tradingstrategy-ai/frontend:v4
```

Then you can try to poke the backend port directly:

```shell
apt update
apt install -y telnet
telnet host.docker.internal 3456
```

For more information, see [host.docker.internal on Linux](https://stackoverflow.com/questions/48546124/what-is-linux-equivalent-of-host-docker-internal).

### Building container locally

```shell
docker build --build-arg FONT_ZIP_DOWNLOAD_URL=${FONT_ZIP_DOWNLOAD_URL} .
```
