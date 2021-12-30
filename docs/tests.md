# How to Test

We use Cypress as our main tool for testing, the scripts are following the cypress standard.

### Start interactive Cypress

Run cypress in the browser.

![image](https://user-images.githubusercontent.com/3521485/136263427-8ade3dbe-d658-4502-80f8-02bccb4400f0.png)

```shell
npm run cypress:open
```
### Cypress for continous integration

Run cypress with the headless browser. Before running cypress tests the app should be running.

```shell
npm run cypress:open
```
### Run unit tests made with svelte-testing-library

Still experimental we can run unit tests for components but not working with routes yet. This

```shell
npm run test
```
## Before commit

Test that everything compiles in the production build:

```shell
export PRODUCTION=true
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
rm -rf build && node_modules/.bin/svelte-kit build && node build/index.js
```

To render the blog roll you also ened

```shell
export VITE_PUBLIC_GHOST_API_URL=https://trading-strategy.ghost.io
export VITE_PUBLIC_GHOST_CONTENT_API_KEY=...
```