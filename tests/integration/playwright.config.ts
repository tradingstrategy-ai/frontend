import type { PlaywrightTestConfig } from '@playwright/test';
import { webServerCommand } from '../helpers.js';

const config: PlaywrightTestConfig = {
	testDir: '.',
	webServer: [
		{
			command: `${webServerCommand()} -- --mode=test`,
			port: 4173
		},
		{
			command: 'cd ../fixtures && npx json-server db.json --port 3456 --routes routes.json',
			port: 3456
		}
	],
	use: {
		baseURL: 'http://localhost:4173/'
	}
};

export default config;
