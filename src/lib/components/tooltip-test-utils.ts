import { flushSync } from 'svelte';

/**
 * Open every `Tooltip` in the document so its popup content is rendered.
 *
 * Tooltip popups are created lazily on first hover/focus, so component tests that
 * assert on popup text must open the tooltips first. Uses `flushSync` rather than
 * `tick()` so it also works under `vi.useFakeTimers()`.
 */
export function openAllTooltips(root: ParentNode = document): void {
	for (const tooltip of root.querySelectorAll('.tooltip')) {
		tooltip.dispatchEvent(new MouseEvent('mouseenter'));
	}
	flushSync();
}
