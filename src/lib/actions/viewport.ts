/**
 * Mobile Safari does not correctly reflect viewport height with % or vh units
 * when address bar or virtual keyboard are open. It does, however, support
 * the VisualViewport JS API for getting the (real) visual viewport size.
 *
 * Apply to the element that consumes `--viewport-height` (a full-screen dialog)
 * rather than `<body>`: reading `visualViewport.height` forces a synchronous
 * layout of the whole document and a custom property on `<body>` invalidates
 * the styles of every element on every viewport resize — on a 75-row vault
 * listing that cost ~100 ms per event on phones, where the address bar
 * resizes the visual viewport on scroll.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 *
 * @param node element whose `--viewport-height` custom property is kept in sync
 * @param active only listen while the consumer is visible
 */
export function setViewportHeight(node: HTMLElement, active = true) {
	function handleResize() {
		node.style.setProperty('--viewport-height', `${visualViewport?.height}px`);
	}

	function update(isActive: boolean) {
		visualViewport?.removeEventListener('resize', handleResize);
		if (isActive && visualViewport) {
			handleResize();
			visualViewport.addEventListener('resize', handleResize);
		} else {
			node.style.removeProperty('--viewport-height');
		}
	}

	update(active);

	return {
		update,
		destroy: () => update(false)
	};
}
