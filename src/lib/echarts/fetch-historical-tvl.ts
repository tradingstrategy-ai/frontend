/**
 * Retry transient chart-data failures without retrying permanent client errors.
 * Cancellation stops both a pending fetch and the delay before its next attempt.
 *
 * @param url Chart-data endpoint, including its payload version.
 * @param signal Cancellation signal for navigation away or a replacement request.
 * @param fetchFn Fetch implementation, injectable for tests.
 */
export async function fetchHistoricalTvl<T>(url: string, signal: AbortSignal, fetchFn = fetch): Promise<T> {
	for (let attempt = 0; ; attempt += 1) {
		signal.throwIfAborted();
		let failure: Error;
		try {
			const response = await fetchFn(url, { signal });
			if (response.ok) return (await response.json()) as T;
			failure = new Error(`Failed to fetch historical chart data: ${response.status}`);
			if (![500, 502, 503, 504].includes(response.status) || attempt >= 2) throw failure;
		} catch (error) {
			signal.throwIfAborted();
			// Fetch reports network failures as TypeError. Other failures, including
			// malformed successful responses, need explicit user recovery.
			if (!(error instanceof TypeError) || attempt >= 2) throw error;
			failure = error;
		}

		await new Promise<void>((resolve, reject) => {
			const cancel = () => {
				clearTimeout(timer);
				reject(signal.reason ?? failure);
			};
			const timer = setTimeout(
				() => {
					signal.removeEventListener('abort', cancel);
					resolve();
				},
				1000 * (attempt + 1)
			);
			signal.addEventListener('abort', cancel, { once: true });
		});
	}
}
