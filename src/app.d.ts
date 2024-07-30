import 'unplugin-icons/types/svelte';
import type { CountryCode } from '$lib/helpers/geo';
import type { CandleTimeBucket } from '$lib/chart';

// For information about these interfaces, see:
// https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		interface Error {
			message: string;
			chainName?: string;
			stack?: string[];
			eventId?: string;
		}

		interface Locals {
			admin?: boolean;
			ipCountry?: CountryCode;
		}

		interface PageState {
			timeBucket?: CandleTimeBucket;
		}

		// interface PageData {}
		// interface Platform {}
	}
}

export {};
