// Ambient type declarations (separate from app.d.ts)
// see: https://kit.svelte.dev/docs/types#app
declare global {
	type Maybe<T> = T | null | undefined;
	type MaybeNumber = MaybeType<number>;
	type MaybeString = MaybeType<string>;
	// Decimals are passed as string, because JS is limited to 53 bits
	type MaybeDecimalNumber = MaybeNumber | MaybeString;
	type MaybeNumberOrString = MaybeType<number | string>;
	type MaybeDate = MaybeType<Date>;
	type MaybePromise<T> = T | Promise<T>;

	type Formatter<T> = (value: T) => string;

	type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

	type Address = `0x${string}`;
	type Contracts = Record<string, Address>;
}

export {};
