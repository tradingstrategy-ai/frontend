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
			envPrefix: 'FRONTEND_'
		}),

		alias: {
			'design-system-fonts': 'deps/fonts',
			'trade-executor': 'deps/trade-executor-frontend/src/lib',
			wizard: 'src/routes/wizard'
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
	})
};

export default config;
