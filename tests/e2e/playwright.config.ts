import { defineConfig } from '@playwright/test';
import { webServerConfig } from '../helpers';

export default defineConfig({
	webServer: webServerConfig('test'),
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
