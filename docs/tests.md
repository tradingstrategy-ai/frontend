# How to Test

We use Cypress as our main tool for testing, the scripts are following the cypress standard.

### Test package

Tests are in a separate package because of conflict of TS module type for SvelteKit (`type: "module"`)
and Cypress (`type: "node"`).

```shell
cd tests
npm install
```

### Start interactive Cypress

Run cypress in the browser.

![image](https://user-images.githubusercontent.com/3521485/136263427-8ade3dbe-d658-4502-80f8-02bccb4400f0.png)

First, make sure you have an instance of the web server running on port 3000 (run from
project root):

```shell
npm run dev -- --port=3000
```

Next, to run the full cypress test suite (run from `tests` directory):

```shell
npm run cypress:open
```

Replace `open` with `run` in the above command to run the tests headless. Or run individual tests with:

```shell
npx cypress run cypress/integration/about.spec.js
```

### Cypress for continous integration

Ensure that npm and submodule dependencies are installed, then run:

```
./script/run-cypress.bash
```

This will install cypress dependencies, start a dev server on port 3000, run the tests, and kill the server on completion.

### Run unit tests made with svelte-testing-library

Still experimental we can run unit tests for components but not working with routes yet. This

```shell
npm run test
```
