/**
 * SvelteKit configuration file. See:
 * https://kit.svelte.dev/docs/configuration
 */
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Use a separate SvelteKit output directory for test builds so they
 * don't interfere with the dev server. The env var is set by vite.config.ts
 * (which has access to the Vite mode) and is inherited by Worker threads
 * used during postbuild analysis.
 */
const isTestMode = process.env.__SVELTEKIT_TEST_MODE === '1';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: node({
			envPrefix: 'FRONTEND_'
		}),

		outDir: isTestMode ? '.svelte-kit-test' : '.svelte-kit',

		alias: {
			'design-system-fonts': 'deps/fonts',
			'trade-executor': 'src/lib/trade-executor'
		},

		// prevent clickjacking (block 3rd-parties from including site via iframe)
		csp: {
			directives: {
				'frame-ancestors': ['self']
			}
		},

		env: {
			publicPrefix: 'TS_PUBLIC_'
		}
	},

	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
