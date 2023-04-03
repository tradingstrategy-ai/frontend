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

		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
