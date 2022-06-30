/// <reference types="@sveltejs/kit" />

import { Config } from '$lib/config';

declare global {
	namespace App {
		interface Locals {}

		interface Platform {}

		interface Session {
			config: Config;
		}

		interface Stuff {}
	}
}
