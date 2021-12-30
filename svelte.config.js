import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-static';

let config;

const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const FRONTEND_SSR = process.env.FRONTEND_SSR || false;

console.log(`Frontend SSR: ${FRONTEND_SSR}`);
console.log(`Frontend post: ${FRONTEND_PORT}`);

if(FRONTEND_SSR || process.env.PRODUCTION) {
	// build server-side rendering
	config = {
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess(),

		// Create an adapter that creates build/index.js Node application
		// https://github.com/sveltejs/kit/tree/master/packages/adapter-node
		kit: {
			adapter: node({
				env: {
					port: 'FRONTEND_PORT',
			}}),
			files: {
				hooks: "src/hooks"
			},

			// https://kit.svelte.dev/docs#configuration-hostheader
			headers: {
				host: 'X-Forwarded-Host',
				protocol: 'X-Forwarded-Proto'
			}
		}

	};
} else {
	// build single page app
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
