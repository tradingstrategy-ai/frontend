import 'unplugin-icons/types/svelte';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { CountryCode } from '$lib/helpers/geo';
import type { TimeBucket } from '$lib/schemas/utility';

// For information about these interfaces, see:
// https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		interface Error {
			message: string;
			chainName?: string;
			stack?: string[];
			issues?: readonly StandardSchemaV1.Issue[] | undefined;
			eventId?: string;
		}

		interface Locals {
			admin?: boolean;
			ipCountry?: CountryCode;
			announcementDismissedAt?: Date;
		}

		interface PageState {
			timeBucket?: TimeBucket;
		}

		// interface PageData {}
		// interface Platform {}
	}
}

export {};
