import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-static';

let config;

if(process.env.PRODUCTION) {
	console.log("Using production config");
	config = {
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess(),

		// Create an adapter that creates build/index.js Node application
		// https://github.com/sveltejs/kit/tree/master/packages/adapter-node
		kit: {
			adapter: node(),
		}

	};
} else {
	console.log("Using local dev env config");
	config = {
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess(),

		kit: {
			// hydrate the <div id="svelte"> element in src/app.html
			target: '#svelte'
		}
	};
}

config.kit.vite = {
	optimizeDeps: {
		include: ["highlight.js/lib/core"],
	},
	server: {
    fs: {
      allow: [
					`${process.env.PWD}`
			]
    }
  }
}

export default config;
