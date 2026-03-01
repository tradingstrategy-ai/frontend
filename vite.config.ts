/**
 * Vite configuration file; see: https://vite.dev/config/
 */
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { type LogOptions, createLogger } from 'vite';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';
import { sentrySvelteKit } from '@sentry/sveltekit';
import { enhancedImages } from '@sveltejs/enhanced-img';
import devtoolsJson from 'vite-plugin-devtools-json';
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server';

const customLogger = ((logger) => {
	return {
		...logger,

		// suppress /*#__PURE__*/ Rollup warnings from ox during build
		warn(msg: string, options: LogOptions) {
			if (msg.includes('/*#__PURE__*/')) return;
			logger.warn(msg, options);
		}
	};
})(createLogger());

export default defineConfig(({ mode }) => {
	// Signal test mode to svelte.config.js via env var so it uses a separate
	// outDir. This env var is inherited by Worker threads (unlike process.argv),
	// ensuring the postbuild analysis worker resolves the correct output directory.
	if (mode === 'test') {
		process.env.__SVELTEKIT_TEST_MODE = '1';
	}

	return {
		// Separate Vite cache for test builds so they don't interfere with the dev server
		cacheDir: mode === 'test' ? 'node_modules/.vite-test' : undefined,

		plugins: [
			// Sentry plugin must be added befoer sveltekit plugin. See:
			// https://docs.sentry.io/platforms/javascript/guides/sveltekit/manual-setup/#vite-setup
			sentrySvelteKit({
				autoUploadSourceMaps: false
			}),

			enhancedImages(),

			sveltekit(),

			devtoolsJson(),

			// see: https://github.com/unplugin/unplugin-icons
			Icons({
				compiler: 'svelte',
				scale: 1,
				customCollections: {
					local: FileSystemIconLoader('./src/lib/assets/icons', (svg) => {
						return svg.replace(
							/^<svg /,
							'<svg style="font-size: var(--icon-size, 1em); color: var(--icon-color, currentcolor);" '
						);
					})
				},
				iconCustomizer(_, icon, props) {
					props.class = `icon ${icon}`;
				}
			}),

			// vite plugin to create mock API for integration tests
			// https://vite-plugin-mock-dev-server.netlify.app/
			mockDevServerPlugin({
				prefix: '^/api',
				dir: 'tests/mocks'
			})
		],

		// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
		// see: https://svelte.dev/docs/svelte/testing#Unit-and-integration-testing-using-Vitest
		resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,

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

		preview: {
			allowedHosts: ['.tradingstrategy.ai']
		},

		// vitest configuration for unit tests (`pnpm run test:unit`)
		// https://vitest.dev/config/
		test: {
			environment: 'jsdom',
			globals: true,
			include: ['src/**/*.{test,spec}.{js,ts}'],
			restoreMocks: true,
			setupFiles: ['./vitest.setup.js']
		}
	};
});
