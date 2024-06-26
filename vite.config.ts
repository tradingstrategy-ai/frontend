/**
 * Vite 4 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { sveltekit } from '@sveltejs/kit/vite';
import { type LogOptions, createLogger } from 'vite';
import { defineConfig } from 'vitest/config';
import { sentrySvelteKit } from '@sentry/sveltekit';
import jsonServer from 'vite-plugin-simple-json-server';

const customLogger = (({ info, warnOnce, ...otherLogMethods }) => {
	return {
		...otherLogMethods,

		// suppress svg build output during CI (spammy due to cryptocurrency-icons)
		info(msg: string, options: LogOptions) {
			if (!!process.env.CI && /immutable\/assets\/.*\.svg/.test(msg)) return;
			info(msg, options);
		},

		// suppress missing sourcemap warnings from @aave/math-utils during unit tests
		warnOnce(msg: string, options: LogOptions) {
			if (/^Sourcemap for ".*@aave\/math-utils/.test(msg)) return;
			warnOnce(msg, options);
		}
	};
})(createLogger());

export default defineConfig({
	plugins: [
		// Sentry plugin must be added befoer sveltekit plugin. See:
		// https://docs.sentry.io/platforms/javascript/guides/sveltekit/manual-setup/#vite-setup
		sentrySvelteKit({
			autoUploadSourceMaps: false
		}),

		sveltekit(),

		// vite plugin to create a mock JSON api for integration tests
		// only available when using `npm run dev` or `npm run preview`
		// https://github.com/alextim/vite-plugin-simple-json-server/
		jsonServer({
			logLevel: 'silent',
			mockDir: 'tests/fixtures'
		})
	],

	server: {
		fs: {
			allow: [process.cwd()]
		}
	},

	customLogger,

	build: {
		// suppress chunk size warning during build
		chunkSizeWarningLimit: 600,
		sourcemap: true
	},

	// vitest configuration for unit tests (`npm run test:unit`)
	// https://vitest.dev/config/
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}'],
		restoreMocks: true,
		setupFiles: ['tests/vitest.config.ts']
	}
});
