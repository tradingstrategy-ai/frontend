/**
 * Generic helpers for serialising/deserialising search state to/from URL query parameters.
 *
 * Define a schema mapping param names to types and defaults, then use
 * `deserialiseSearchParams` to read from a URL and `serialiseSearchParams`
 * to write back — omitting any values that match their defaults.
 */

interface StringParam {
	type: 'string';
	defaultValue: string;
	/** When provided, the param value is validated against these options; invalid values fall back to defaultValue */
	options?: readonly string[];
}

interface NumberParam {
	type: 'number';
	defaultValue: number;
}

export type ParamDef = StringParam | NumberParam;
export type ParamSchema = Record<string, ParamDef>;

/** Infer the state object type from a schema definition */
export type StateFromSchema<S extends ParamSchema> = {
	[K in keyof S]: S[K] extends NumberParam ? number : string;
};

/**
 * Read URL search params into a typed state object, validating each value
 * against the schema. Invalid or missing values fall back to defaults.
 */
export function deserialiseSearchParams<S extends ParamSchema>(
	searchParams: URLSearchParams,
	schema: S
): StateFromSchema<S> {
	const state = {} as Record<string, string | number>;

	for (const [key, def] of Object.entries(schema)) {
		const raw = searchParams.get(key);

		if (def.type === 'number') {
			const parsed = Number(raw);
			state[key] = Number.isFinite(parsed) && raw !== null ? parsed : def.defaultValue;
		} else {
			if (raw === null) {
				state[key] = def.defaultValue;
			} else if (def.options) {
				state[key] = def.options.includes(raw) ? raw : def.defaultValue;
			} else {
				state[key] = raw;
			}
		}
	}

	return state as StateFromSchema<S>;
}

/**
 * Serialise a state object to a query string, omitting params that match
 * their default value to keep URLs clean. Returns the query string without
 * a leading `?`.
 */
export function serialiseSearchParams<S extends ParamSchema>(state: StateFromSchema<S>, schema: S): string {
	const params = new URLSearchParams();

	for (const [key, def] of Object.entries(schema)) {
		const value = state[key as keyof typeof state];
		if (value !== undefined && value !== def.defaultValue) {
			params.set(key, String(value));
		}
	}

	return params.toString();
}
