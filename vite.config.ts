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
import jsonServer from 'vite-plugin-simple-json-server';

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

export default defineConfig({
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

		// vite plugin to create a mock JSON api for integration tests
		// only available when using `npm run dev` or `npm run preview`
		// https://github.com/alextim/vite-plugin-simple-json-server/
		jsonServer({
			logLevel: 'silent',
			mockDir: 'tests/fixtures'
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

	// vitest configuration for unit tests (`npm run test:unit`)
	// https://vitest.dev/config/
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}'],
		restoreMocks: true,
		setupFiles: ['./vitest.setup.js']
	}
});
