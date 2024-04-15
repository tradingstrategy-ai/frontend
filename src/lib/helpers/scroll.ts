import { browser } from '$app/environment';

/**
 * Prevent body from scrolling, e.g., when a modal is open.
 *
 * see: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
 *
 * @param disabled true to disable body scrolling
 */
export function toggleBodyScroll(disabled = false) {
	if (!browser) return;

	if (disabled) {
		document.body.style.top = `-${window.scrollY}px`;
		document.body.style.position = 'fixed';
		document.body.style.width = '100%';
	} else {
		const scrollY = document.body.style.top;
		document.body.style.top = '';
		document.body.style.position = '';
		document.body.style.width = '';
		window.scrollTo(0, parseInt(scrollY || '0') * -1);
	}
}
