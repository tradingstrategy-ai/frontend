/**
 * SvelteKit configuration file. See:
 * https://kit.svelte.dev/docs/configuration
 */
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
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

		// disable CSRF origin checking for now; see:
		// - https://kit.svelte.dev/docs/configuration#csrf
		// - https://github.com/sveltejs/kit/tree/master/packages/adapter-node#origin-protocol_header-and-host_header
		csrf: {
			checkOrigin: false
		},

		env: {
			publicPrefix: 'TS_PUBLIC_'
		}
	},

	preprocess: vitePreprocess()
};

export default config;
