import { defineConfig } from '@playwright/test';
import { ciRetries, privateR2WebServerConfig } from '../helpers';

export default defineConfig({
	testMatch: /private-r2\.test\.ts/,
	webServer: privateR2WebServerConfig('test'),
	use: { baseURL: 'http://127.0.0.1:4173' },
	retries: ciRetries,
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
