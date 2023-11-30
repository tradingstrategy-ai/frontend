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
