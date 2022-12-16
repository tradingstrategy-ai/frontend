/**
 * Vite 3 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { sveltekit } from '@sveltejs/kit/vite';
import replace from '@rollup/plugin-replace';
import postcssPresetEnv from 'postcss-preset-env';
import fontDisplay from 'postcss-font-display';
import jsonServer from 'vite-plugin-simple-json-server';
import GithubActionsReporter from 'vitest-github-actions-reporter';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),

		// Strip bogus sourcemap from chartiq.css
		replace({
			values: { 'sourceMappingURL=chartiq.css.map': '' },
			preventAssignment: true
		}),

		// vite plugin to create a mock JSON api for integration tests
		// only available when using `npm run dev` or `npm run preview`
		// https://github.com/alextim/vite-plugin-simple-json-server/
		jsonServer({
			logLevel: 'silent',
			mockDir: 'tests/fixtures'
		})
	],

	optimizeDeps: {
		include: ["highlight.js", "highlight.js/lib/core"],
	},

	server: {
		fs: {
			allow: [process.cwd()]
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
	},

	// vitest configuration for unit tests (`npm run test:units`)
	// https://vitest.dev/config/
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.ts'],
		reporters: process.env.GITHUB_ACTIONS ? ['dot', new GithubActionsReporter()] : 'default',
		restoreMocks: true,
		setupFiles: ['test.config.ts']
	},
};

export default config;
