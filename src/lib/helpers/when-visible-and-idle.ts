/**
 * Resolve once `element` is near the viewport and the browser has an idle moment, so heavy
 * below-the-fold work (loading and drawing a chart library) does not compete with hydration
 * and the first paint.
 *
 * Falls back to resolving immediately where `IntersectionObserver` is unavailable, and to a
 * timer where `requestIdleCallback` is (Safari). An idle callback is forced after `idleTimeoutMs`
 * so a busy page still gets its chart.
 *
 * @param element element whose visibility gates the work
 * @param options.rootMargin how far outside the viewport counts as near (default 300px)
 * @param options.idleTimeoutMs longest wait for an idle moment once visible (default 1500 ms)
 * @param options.signal stops waiting (the promise then never resolves)
 */
export function whenVisibleAndIdle(
	element: Element,
	{
		rootMargin = '300px',
		idleTimeoutMs = 1500,
		signal
	}: { rootMargin?: string; idleTimeoutMs?: number; signal?: AbortSignal } = {}
): Promise<void> {
	return new Promise((resolve) => {
		if (signal?.aborted) return;

		const runWhenIdle = () => {
			if (signal?.aborted) return;
			if ('requestIdleCallback' in window) {
				const handle = window.requestIdleCallback(() => resolve(), { timeout: idleTimeoutMs });
				signal?.addEventListener('abort', () => window.cancelIdleCallback(handle), { once: true });
			} else {
				const handle = setTimeout(resolve, 1);
				signal?.addEventListener('abort', () => clearTimeout(handle), { once: true });
			}
		};

		if (!('IntersectionObserver' in window)) {
			runWhenIdle();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				runWhenIdle();
			},
			{ rootMargin }
		);
		observer.observe(element);
		signal?.addEventListener('abort', () => observer.disconnect(), { once: true });
	});
}
