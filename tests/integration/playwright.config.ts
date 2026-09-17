import { defineConfig } from '@playwright/test';
import { ciRetries, webServerConfig } from '../helpers';

export default defineConfig({
	testIgnore: /private-r2\.test\.ts/,
	webServer: webServerConfig('test'),
	use: { baseURL: 'http://127.0.0.1:4173' },
	retries: ciRetries,
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
