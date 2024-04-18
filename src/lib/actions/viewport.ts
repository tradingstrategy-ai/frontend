/**
 * Mobile Safari does not correctly reflect viewport height with % or vh units
 * when address bar or virtual keyboard are open. It does, however, support
 * the VisualViewport JS API for getting the (real) visual viewport size.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
 */
export function setViewportHeight(node: HTMLElement) {
	const { visualViewport } = window;
	if (!visualViewport) return;

	const setCssVar = () => {
		node.style.setProperty('--viewport-height', `${visualViewport.height}px`);
	};

	setCssVar();
	visualViewport.addEventListener('resize', setCssVar);

	return {
		destroy: () => visualViewport.removeEventListener('resize', setCssVar)
	};
}
