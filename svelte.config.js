/**
 * SvelteKit configuration for Trading Strategy frontend
 *
 * Supports
 *
 * - Local dev server using Vite w/ SSR
 * - Production Node.js server w/SSR
 *
 */
import preprocess from 'svelte-preprocess';
import node from '@sveltejs/adapter-node';

let config;

// We prefix all environment variables with FRONTEND_
// so that they do not get mixed up e.g. with Docker environment variables
const SSR = process.env.SSR || false;
const PRODUCTION = process.env.PRODUCTION || false;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

console.log(`SSR: ${SSR}`);
console.log(`PRODUCTION: ${PRODUCTION}`);
console.log(`Frontend port: ${FRONTEND_PORT}`);
console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);

if (SSR || process.env.PRODUCTION) {
	console.log('Using SSR config');
	// build server-side rendering
	config = {
		onwarn: (warning, defaultHandler) => {
			// Disable all warnings during the local compilation for now
			// As these warnings are spammy
		},

		compilerOptions: {
			enableSourcemap: true
		},
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess({
			sourceMap: true
		}),

		// Create an adapter that creates build/index.js Node application
		// https://github.com/sveltejs/kit/tree/master/packages/adapter-node
		kit: {
			adapter: node({
				// All Node adapter configuration options are in format
				// FRONTEND_PORT
				// FRONTEND_ORIGIN
				envPrefix: 'FRONTEND_'
			}),

			files: {
				hooks: 'src/hooks'
			}
		}
	};
} else {
	// build single page app
	console.log('Using local dev env config');

	config = {
		onwarn: (warning, defaultHandler) => {
			// Disable all warnings during the local compilation for now
		},

		compilerOptions: {
			enableSourcemap: true
		},
		// Consult https://github.com/sveltejs/svelte-preprocess
		// for more information about preprocessors
		preprocess: preprocess({
			sourceMap: true
		}),

		kit: {}
	};
}

config.kit.vite = {
	optimizeDeps: {},
	server: {
		fs: {
			allow: [`${process.env.PWD}`]
		}
	},

	// Disable 300kb vendor.js chunk generation
	// https://rollupjs.org/guide/en/#big-list-of-options
	// This will give us some 0.2 seconds on FCP and LCP
	// https://stackoverflow.com/a/70499134/315168
	build: {
		rollupOptions: {
			output: {
				manualChunks: undefined
			}
		}
	}
};

export default config;
