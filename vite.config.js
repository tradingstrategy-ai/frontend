/**
 * Vite 3 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { sveltekit } from '@sveltejs/kit/vite';
import replace from '@rollup/plugin-replace';
import postcssPresetEnv from 'postcss-preset-env';
import fontDisplay from 'postcss-font-display';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),

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
