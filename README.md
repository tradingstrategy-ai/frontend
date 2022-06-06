[![Automated test suite](https://github.com/tradingstrategy-ai/frontend/actions/workflows/javascript.yml/badge.svg)](https://github.com/tradingstrategy-ai/frontend/actions/workflows/javascript.yml)

# Trading Strategy protocol website

A frontend for [Trading Strategy protocol](https://tradingstrategy.ai).

## Install

Node v16+ required.

Clone `trade-executor` and master of `trade-executor-frontend` with the following folder structure:

```sh
git clone git@github.com:tradingstrategy-ai/frontend.git
cd frontend
git clone git@github.com:tradingstrategy-ai/trade-executor-frontend.git ../trade-executor-frontend
npm install
```

## Building the theme

Theme is available as a separate git submodule.
It is based on a MIT licensed [Neumorphism UI by Themesberg](https://github.com/themesberg/neumorphism-ui-bootstrap).
The theme is Bootstrap v4 based.

Pull the submodule

```shell
git submodule update --init --recursive
```

Then

```shell
# Runs npm build steps on packages included as submodules and generates old theme Bootstrap bundle
bash scripts/build-deps.sh
```

## Running in local dev

Environment variables required by the app are maintained in a `.env` file. Read about about
[magic VITE envs](https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte).

Then start SvelteKit development server

```shell
npm run dev
```

## Documentation

- [How to develop and integrate the Bootstrap theme](./docs/theme.md)
- [Testing](./docs/tests.md)
- [Running in production](./docs/production.md)
- [Doing page speed tests](./docs/speed.md)

## Notes

### Code Formatting Standards

We are using [Prettier](https://prettier.io/) for code formatting. Extensions are available for
most code editors / IDEs (see "Editor Support" on Prettier homepage).

If you prefer not to have your editor do automatic formatting, please run the following command and
commit properly formatted code before pushing a PR:

```bash
npm run format
```

Our CI/CD pipeline runs the following chack on PRs or pushes to `master`:

```bash
npm run format:check
```

### SvelteKit and Svelte component installation issue

[Any external Svelte components need to be installed as development dependency because of SSR](https://github.com/sveltejs/sapper-template#using-external-components).
