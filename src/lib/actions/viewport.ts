/**
 * Mobile Safari does not correctly reflect viewport height with % or vh units
 * when address bar or virtual keyboard are open. It does, however, support
 * the VisualViewport JS API for getting the (real) visual viewport size.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 */
export function setViewportHeight(node: HTMLElement) {
	const docRoot = document.documentElement;

	function setValue({ style }: HTMLElement, value: string) {
		style.setProperty('--viewport-height', value);
	}

	function handleResize() {
		setValue(node, `${visualViewport?.height}px`);
	}

	function destroy() {
		visualViewport?.removeEventListener('resize', handleResize);
		setValue(node, '');
		setValue(docRoot, '');
	}

	setValue(docRoot, '100vh');
	visualViewport && handleResize();
	visualViewport?.addEventListener('resize', handleResize);

	return { destroy };
}
