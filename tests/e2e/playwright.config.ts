import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerCommand } from '../helpers.js';

const config: PlaywrightTestConfig = {
	testDir: '.',
	webServer: {
		command: webServerCommand(),
		port: 4173
	},
	use: {
		baseURL: 'http://localhost:4173/'
	}
};

export default config;
