import { defineConfig } from '@playwright/test';
import { webServerConfig } from '../helpers';

export default defineConfig({
	webServer: webServerConfig('production'),
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
});
