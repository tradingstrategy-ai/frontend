/**
 * Deep merge source object onto target. Primitive values, arrays,
 * functions and class instances are copied. Pure objects are merged.
 *
 * @param target object
 * @param source object
 * @returns target object with merged properties
 */
export function merge(target: any = {}, source: any = {}) {
	for (const [key, val] of Object.entries(source)) {
		target[key] = isPureObject(val) ? merge(target[key], val) : val;
	}
	return target;
}

/**
 * Check if arg is a pure object (i.e, an object with no prototype)
 */
function isPureObject(obj: any): obj is Object {
	return obj instanceof Object && Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Copy only the given keys from an object.
 *
 * @param obj source object
 * @param keys keys to keep
 * @returns a new object with just those keys
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
	return Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<T, K>;
}
