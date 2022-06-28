# Docker container

The SvelteKit is run in a docker container.

## Building the container

- The container is build in [javascript.yml](../.github/workflows/javascript.yml) and uploaded to Github registry.

- The container is published on Github registry ghcr.io based on PR id

Example container name that can be accepted by `docker` or `docker-compose`

```
ghcr.io/tradingstrategy-ai/frontend:pr-58
```

## Creating PAT to access Github container registry

- Go to [Personal tokens](https://github.com/settings/tokens) in Github Developer settings.
- Generate new token
- Save the token in the password manager
- Select the read:packages scope to download container images and read their metadata.
- Select the write:packages scope to download and upload container images and read and write their metadata.
- Select the delete:packages scope to delete container images.

## Running the container locally

Login to the ghcr using your Github username and access token as a password:

```shell
docker login ghcr.io -u miohtama
```

Then pull any image using its pull request number:

```shell
docker pull ghcr.io/tradingstrategy-ai/frontend:pr-58

Run it with your environment variables:

```shell
export SSR=TRUE
# Assume locally run backend, see backend/docs/local-staging.md
export VITE_PUBLIC_BACKEND_INTERNAL_URL=http://host.docker.internal:3456/api
export VITE_SITE_MODE=production
docker run -p 3000:3000 --platform linux/amd64 ghcr.io/tradingstrategy-ai/frontend:pr-58
```

Then visit [http://localhost:3000/](http://localhost:3000/).

## Running the container on production

You can run the latest frontend on the production server with:

```shell
docker login ghcr.io -u miohtama
docker-compose up -d 
```

This will fetch the latest version and restart the frontend.

Then visit [http://localhost:3000](http://localhost:3000).

## Listing available tags for a container on ghcr.io

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

```
{"name":"tradingstrategy-ai/frontend","tags":["pr-58"]}
```

## More information

* https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-docker-registry

* https://nira.com/github-container-registry/