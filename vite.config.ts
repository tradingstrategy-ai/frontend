/**
 * Vite 4 configuration file. See:
 * https://kit.svelte.dev/docs/project-structure#project-files-vite-config-js
 * https://vitejs.dev/config/
 */
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { type LogOptions, createLogger } from 'vite';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { sentrySvelteKit } from '@sentry/sveltekit';
import jsonServer from 'vite-plugin-simple-json-server';

const customLogger = (({ warnOnce, ...otherLogMethods }) => {
	return {
		...otherLogMethods,

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

		// see: https://github.com/unplugin/unplugin-icons
		Icons({
			compiler: 'svelte',
			scale: 1,
			customCollections: {
				local: FileSystemIconLoader('./src/lib/assets/icons')
			}
		}),

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
