/**
 * SvelteKit configuration file. See:
 * https://kit.svelte.dev/docs/configuration
 */
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: node({
			envPrefix: 'FRONTEND_'
		}),

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

		experimental: {
			remoteFunctions: true
		}
	},

	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
