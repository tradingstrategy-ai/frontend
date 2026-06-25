import { defineConfig } from '@playwright/test';
import { ciRetries, webServerConfig } from '../helpers';

export default defineConfig({
	webServer: webServerConfig('production'),
	retries: ciRetries,
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
