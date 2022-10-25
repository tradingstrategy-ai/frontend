import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerConfig } from '../helpers.js';

const config: PlaywrightTestConfig = {
	webServer: webServerConfig('production'),
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
};

export default config;
