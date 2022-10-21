/**
 * command used to start SvelteKit preview server
 * use `--skip-build` flag to skip build step (runs faster)
 * e.g.,: `npm run test:integration --skip-build`
 */
export function webServerCommand() {
	if (process.env.npm_config_skip_build) {
		return 'npm run preview';
	}
	return 'npm run build && npm run preview';
}
