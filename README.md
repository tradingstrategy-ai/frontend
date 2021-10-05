# TradingStrategy.ai website frontend

This is a source code for [SvelteKit website](https://kit.svelte.dev/docs) based website that shows real-time information on available [Capitalgram datasets](https://mightyeagle.capitalgram.com/datasets).

## Install

Node v14+ required.

```sh
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
cd theme
npm install
npx gulp build:dist
```

This will produce files in `theme/dist` folder.

Or as one liner:

```shell
( cd theme && npx gulp build:dist )
```

## Running in local dev

Set the backend URL. [Read about about magic VITE envs](https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte).

```shell
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api

# Or if you run on localhost
export VITE_PUBLIC_BACKEND_URL=http://localhost:3456/api
```
`
Then start SvelteKit development server

```shell
npm run dev
```

## Before commit

Test that everything compiles in the production build:

```shell
export PRODUCTION=true
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
rm -rf build && node_modules/.bin/svelte-kit build && node build/index.js
```

## Running on production

This will run server-side generated (SSR) pages.

```shell
screen -S frontend
export PRODUCTION=true
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
npm install
(cd theme && npm install && npx gulp build:dist)
rm -rf build && node_modules/.bin/svelte-kit build && node build/index.js
```

[Port troubleshooting](https://www.tecmint.com/find-out-which-process-listening-on-a-particular-port/)

```shell
netstat -ltnp | grep -w ':80'
```

## Theme development

You can also open the theme development server:

```shell
( cd theme && npx gulp )
```

Editing theme mainly happens in `theme/src/scss/neumorphism/_variables.scss`.

## Color scheme

Primary background: #FFF1E5 - light beige

Primary darker: #CCBEB3 - dark beige

Secondary background: #80DEEA - light turquoise

Darker secondary: #4BACB8 - dark turquoise

Link on white documentation: #005b49

Number go up green: #458b00

Number go down red: #cc0000

[Color scheme in Codepen](https://codepen.io/miohtama/pen/OJgpqNa)

[Palette tools in Material palette designer](https://material.io/resources/color/#!/?view.left=0&view.right=1&primary.color=eeb302&secondary.color=80DEEA)

[Palette generator](https://mycolor.space/?hex=%23FFF1E5&sub=1)

![colormap](./colormap.png?)]

## Fonts

Logo font: Saira Condensed

Headings: Exo 2

Body Text: Open Sans

## Icons

[Licensed Streamline Freehand icons](https://app.streamlinehq.com/icons/streamline-freehand)

# Svelte

[Any external Svelte components need to be installed as development dependency because of SSR](https://github.com/sveltejs/sapper-template#using-external-components).

```shell

```

