import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerConfig } from '../helpers';

const config: PlaywrightTestConfig = {
	webServer: webServerConfig('test'),
	reporter: process.env.GITHUB_ACTIONS ? [['dot'], ['github']] : 'list'
};

export default config;
