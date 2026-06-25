import { defineConfig } from '@playwright/test';
import { ciRetries, webServerConfig } from '../helpers';

export default defineConfig({
	testIgnore: /private-r2\.test\.ts/,
	webServer: webServerConfig('test'),
	retries: ciRetries,
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
