import { defineConfig } from '@playwright/test';
import { privateR2WebServerConfig } from '../helpers';

export default defineConfig({
	testMatch: /private-r2\.test\.ts/,
	webServer: privateR2WebServerConfig('test'),
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
