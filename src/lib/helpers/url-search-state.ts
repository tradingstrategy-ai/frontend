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

interface StringArrayParam {
	type: 'string[]';
	defaultValue: readonly string[];
	/** When provided, unsupported values are omitted. */
	options?: readonly string[];
}

export type ParamDef = StringParam | NumberParam | StringArrayParam;
export type ParamSchema = Record<string, ParamDef>;

/** Infer the state object type from a schema definition */
export type StateFromSchema<S extends ParamSchema> = {
	[K in keyof S]: S[K] extends NumberParam ? number : S[K] extends StringArrayParam ? string[] : string;
};

/**
 * Read URL search params into a typed state object, validating each value
 * against the schema. Invalid or missing values fall back to defaults.
 */
export function deserialiseSearchParams<S extends ParamSchema>(
	searchParams: URLSearchParams,
	schema: S
): StateFromSchema<S> {
	const state = {} as Record<string, string | number | string[]>;

	for (const [key, def] of Object.entries(schema)) {
		if (def.type === 'string[]') {
			const values = searchParams.getAll(key);
			const options = def.options;
			state[key] = values.length
				? options
					? values.filter((value) => options.includes(value))
					: values
				: [...def.defaultValue];
		} else if (def.type === 'number') {
			const raw = searchParams.get(key);
			const parsed = Number(raw);
			state[key] = Number.isFinite(parsed) && raw !== null ? parsed : def.defaultValue;
		} else {
			const raw = searchParams.get(key);
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
		if (def.type === 'string[]') {
			if (!Array.isArray(value)) continue;
			const isDefault =
				value.length === def.defaultValue.length && value.every((item, index) => item === def.defaultValue[index]);
			if (!isDefault) {
				for (const item of value) params.append(key, item);
			}
		} else if (value !== undefined && value !== def.defaultValue) {
			params.set(key, String(value));
		}
	}

	return params.toString();
}
