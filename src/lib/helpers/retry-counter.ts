export type RetryGenerator = Generator<{ delay: number; count: number }, void, unknown> & {
	timer?: number | NodeJS.Timeout;
};

/**
 * Generator for creating a retry counter as an iterator
 *
 * @param max - maximum number of retries
 * @param delay - the base delay time in ms
 *
 * @example
 * ```ts
 * const retries = retryCounter(2, 500);
 * retries.next() // { value: { delay: 500, count: 1 }, done: false }
 * retries.next() // { value: { delay: 1000, count: 2 }, done: false }
 * retries.next() // { value: undefined, done: true }
 * ```
 */
export function* retryCounter(max: number, delay: number): RetryGenerator {
	let count = 0;

	while (count < max) {
		yield {
			delay: delay * 2 ** count,
			count: ++count
		};
	}
}
