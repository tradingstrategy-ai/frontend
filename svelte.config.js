/**
 * SvelteKit configuration file. See:
 * https://kit.svelte.dev/docs/configuration
 */
import node from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import postcssConfig from './postcss.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Disable all warnings during the local compilation for now (spammy)
	onwarn: () => {},

	kit: {
		adapter: node({
			envPrefix: 'FRONTEND_',
			polyfill: false
		}),

		alias: {
			'design-system-fonts': 'deps/fonts',
			'trade-executor-frontend': 'deps/trade-executor-frontend/src/lib'
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

	preprocess: preprocess({
		sourceMap: true,
		postcss: postcssConfig
	}),

	vitePlugin: {
		experimental: {
			// Enable experimental Svelte inspector; see:
			// https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#inspector
			inspector: {
				toggleKeyCombo: 'alt-meta',
				holdMode: true,
				showToggleButton: 'never'
			}
		}
	}
};

export default config;
