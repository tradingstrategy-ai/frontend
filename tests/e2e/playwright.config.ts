import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerConfig } from '../helpers.js';

const config: PlaywrightTestConfig = {
	webServer: webServerConfig('production')
};

export default config;
