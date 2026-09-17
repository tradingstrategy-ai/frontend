// Ambient type declarations (separate from app.d.ts)
// see: https://kit.svelte.dev/docs/types#app
declare global {
	// some numbers (e.g. from API) are given as strings
	type Numberlike = number | string;

	type Maybe<T> = T | null | undefined;
	type MaybeNumber = Maybe<number>;
	type MaybeNumberlike = Maybe<Numberlike>;
	type MaybeString = Maybe<string>;
	type MaybeDate = Maybe<Date>;
	type MaybePromise<T> = T | Promise<T>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- extra arguments are formatter-specific
	type Formatter<T> = (value: T, ...args: any[]) => string;

	/**
	 * A row of a backend JSON payload that has no Zod schema (the trading-view explorer
	 * responses). One documented `any` here instead of one at every call site; give a
	 * payload a schema in `src/lib/schemas/` when its shape is worth pinning down.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type UntypedApiRow = Record<string, any>;

	interface Window {
		// Tawk.to live-chat widget globals, see src/routes/pricing/+page.svelte
		Tawk_API?: Record<string, unknown>;
		Tawk_LoadStart?: Date;
	}

	type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

	type Address = `0x${string}`;

	// utility to expand intersection types for better inline type feedback
	type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
}

export {};
