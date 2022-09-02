/**
 * SvelteKit configuration file. See:
 * https://kit.svelte.dev/docs/configuration
 */
import node from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import postcssPresetEnv from 'postcss-preset-env';

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
			'bootstrap-theme': 'deps/theme/dist',
			'trade-executor-frontend': 'deps/trade-executor-frontend/src/lib'
		},

		env: {
			publicPrefix: 'TS_PUBLIC_'
		}
	},

	preprocess: preprocess({
		sourceMap: true,
		postcss: {
			plugins: [postcssPresetEnv()]
		}
	})
};

export default config;
