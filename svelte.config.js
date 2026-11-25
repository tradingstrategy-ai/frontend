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

		/**
		 * Inline every stylesheet under 40 KB (uncompressed, measured at build time) into the
		 * HTML, so first paint does not wait for separate render-blocking CSS requests. Measured
		 * on 2026-11-22 over HTTP/2 with Brotli (docs/speed.md): FCP −210 to −280 ms on every page
		 * tested against the previous 8 KB, for ~15–20 KB more compressed HTML. Inlining all CSS
		 * gained nothing more. The round 5 attempt was rejected on PageSpeed Insights numbers
		 * later found to be unreliable for this site.
		 */
		inlineStyleThreshold: 40960,

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
		},

		router: {
			resolution: 'server'
		}
	},

	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
