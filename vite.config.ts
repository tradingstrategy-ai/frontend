/**
 * Vite 4 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import postcssPresetEnv from 'postcss-preset-env';
import jsonServer from 'vite-plugin-simple-json-server';
import GithubActionsReporter from 'vitest-github-actions-reporter';

export default defineConfig({
	plugins: [
		sveltekit(),

		// vite plugin to create a mock JSON api for integration tests
		// only available when using `npm run dev` or `npm run preview`
		// https://github.com/alextim/vite-plugin-simple-json-server/
		jsonServer({
			logLevel: 'silent',
			mockDir: 'tests/fixtures'
		})
	],

	optimizeDeps: {
		include: ['highlight.js', 'highlight.js/lib/core']
	},

	server: {
		fs: {
			allow: [process.cwd()]
		}
	},

	css: {
		postcss: {
			plugins: [postcssPresetEnv({ features: { 'nesting-rules': true } })]
		}
	},

	// vitest configuration for unit tests (`npm run test:units`)
	// https://vitest.dev/config/
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}'],
		reporters: process.env.GITHUB_ACTIONS ? ['dot', new GithubActionsReporter()] : 'default',
		restoreMocks: true,
		setupFiles: ['test.config.ts']
	}
});
