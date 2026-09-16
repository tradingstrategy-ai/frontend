/**
 * Keep the `--table-width` custom property in sync with a table's rendered width, for the
 * row-spanning `TargetableLink` anchors (see `TargetableLink.svelte`).
 *
 * Unlike `bind:offsetWidth`, which reads `offsetWidth` synchronously during hydration and
 * so forces a style + layout pass over the whole table before the first paint, this waits
 * for the browser's own layout and updates from `ResizeObserver` only. Until the first
 * observation the anchors fall back to the container width.
 *
 * @usage
 *   <table use:tableWidth>
 */
export function tableWidth(node: HTMLElement) {
	const observer = new ResizeObserver(([entry]) => {
		node.style.setProperty('--table-width', `${entry.borderBoxSize[0]?.inlineSize ?? node.offsetWidth}px`);
	});
	observer.observe(node, { box: 'border-box' });

	return {
		destroy: () => observer.disconnect()
	};
}
