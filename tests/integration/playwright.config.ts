import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerConfig } from '../helpers.js';

const config: PlaywrightTestConfig = {
	webServer: webServerConfig('test')
};

export default config;
