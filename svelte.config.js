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
import postcssPresetEnv from 'postcss-preset-env';
import node from '@sveltejs/adapter-node';
import path from 'path';
import replace from '@rollup/plugin-replace';
import fontDisplay from 'postcss-font-display';

let config;

// We prefix adapter-node environment variables with FRONTEND_
// so that they do not get mixed up e.g. with Docker environment variables
const SSR = process.env.SSR || false;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

console.log(`SSR: ${SSR}`);
console.log(`Frontend port: ${FRONTEND_PORT}`);
console.log(`Frontend origin: ${FRONTEND_ORIGIN}`);

const presetEnvConfig = postcssPresetEnv();

if (SSR) {
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
			sourceMap: true,
			postcss: {
				plugins: [presetEnvConfig]
			}
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
			sourceMap: true,
			postcss: {
				plugins: [presetEnvConfig]
			}
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
	},

	resolve: {
		// alias submodule dependencies
		alias: {
			'design-system-fonts': path.resolve('deps/fonts'),
			'bootstrap-theme': path.resolve('deps/theme/dist'),
			'trade-executor-frontend': path.resolve('deps/trade-executor-frontend/src/lib')
		}
	},

	plugins: [
		replace({
			values: {
				// Strip bogus sourcemap from chartiq.css
				'sourceMappingURL=chartiq.css.map': ''
			},
			preventAssignment: true
		})
	],

	css: {
		postcss: {
			// use `font-display: optional` in SSR build (minimize CLS/FOUT)
			plugins: [presetEnvConfig, fontDisplay({ display: SSR ? 'optional' : 'swap', replace: true })]
		}
	}
};

export default config;
