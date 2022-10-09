/**
 * Vite 3 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import replace from '@rollup/plugin-replace';
import postcssPresetEnv from 'postcss-preset-env';
import fontDisplay from 'postcss-font-display';

const kitPlugins = sveltekit();

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		// Enable experimental Svelte inspector; see:
		// https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/config.md#inspector
		svelte({
			experimental: {
				inspector: {
					toggleKeyCombo: 'control-meta',
					holdMode: true,
					showToggleButton: 'never'
				}
			}
		}),

		// We are manually injecting svelte() plugins above with inspector enabled, so we only
		// need the last plugin from the sveltekit() array of plugins; see:
		// https://github.com/sveltejs/kit/blob/master/packages/kit/src/exports/vite/index.js
		kitPlugins[kitPlugins.length - 1],

		// Strip bogus sourcemap from chartiq.css
		replace({
			values: { 'sourceMappingURL=chartiq.css.map': '' },
			preventAssignment: true
		})
	],

	server: {
		fs: {
			allow: [process.cwd()]
		}
	},

	// Disable 300kb vendor.js chunk generation
	// https://rollupjs.org/guide/en/#big-list-of-options
	// This will give us some 0.2 seconds on FCP and LCP
	// https://stackoverflow.com/a/70499134/315168
	build: {
		rollupOptions: {
			output: { manualChunks: undefined }
		}
	},

	css: {
		postcss: {
			plugins: [
				postcssPresetEnv(),
				// use `font-display: optional` in SSR build (minimize CLS/FOUT)
				fontDisplay({
					display: process.env.NODE_ENV === 'production' ? 'optional' : 'swap',
					replace: true
				})
			]
		}
	}
};

export default config;
