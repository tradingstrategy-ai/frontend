# Docker container

The SvelteKit is run in a docker container.

## Production

### Building the container

- The container is build in [javascript.yml](../.github/workflows/javascript.yml) and uploaded to Github registry.
- The container is published on Github registry ghcr.io based on PR id or tag
- Example container names that can be accepted by `docker` or `docker-compose`
  - `ghcr.io/tradingstrategy-ai/frontend:pr-58`
  - `ghcr.io/tradingstrategy-ai/frontend:v1.0.1`

### Creating a production tag

Any tag starting with `v` is consired a production tag.

Production tags are a sequential series of versions:

- `v1`
- `v2`
- ...
- `v23`

Tag the image for production run with the following one-liner:

```shell
prettier --check --plugin-search-dir=. .
TAG=v4 ; git tag $TAG ; ;git push origin $TAG
```

[Check that the build completes on Github Actions](https://github.com/tradingstrategy-ai/frontend/actions).

### Updating the production server

Sync `docker-compose.yml` to the server (only if compose updates needed):

```shell
scp docker-compose.yml $PROD:./frontend
```

The run:

```shell
ssh $PROD
cd frontend
# Check that prettier passes
source ~/secrets.env
# Password is your PAT, see below
docker login ghcr.io -u miohtama
# Pass the currently acivated version tag to the docker
# to pull the right image, but also to the
# container itself to display the running version
# (see /diagnostics)
export TS_PUBLIC_FRONTEND_VERSION_TAG=v3
docker-compose up -d
```

Check logs that the node-adapter starts properly:

```shell
docker-compose logs
```

Then visit the [diagnostics page(https://tradingstrategy.ai/diagnostics) to see the version tag has been updated.

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

- https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry

- https://nira.com/github-container-registry/
