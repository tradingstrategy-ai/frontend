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

	type Formatter<T> = (value: T) => string;

	type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

	type Address = `0x${string}`;
	type Contracts = Record<string, Address>;
}

export {};
