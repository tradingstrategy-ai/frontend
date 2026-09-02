import { mount, tick, unmount } from 'svelte';
import Tooltip from './Tooltip.svelte';

describe('Tooltip component', () => {
	// This test is intentionally checking for very specific markup:
	// The tooltip popup container MUST be a button element; otherwise
	// you end up with illegal element nesting which leads to page jank
	// (the popup content is not hidden on initial page render).
	// see: https://stackoverflow.com/questions/40531029 updates 3 & 4
	test('should use button tag for popup content', async () => {
		const component = mount(Tooltip, { target: document.body });
		const popup = document.body.querySelector('.popup');
		expect(popup?.tagName).toBe('BUTTON');
		// button should be disabled to remove from tab index and prevent click events
		expect(popup).toBeDisabled();
		await unmount(component);
	});

	test('keeps an open popup inside the viewport and repositions it on scroll', async () => {
		let triggerLeft = 350;
		const originalInnerWidth = window.innerWidth;
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
			if (this.classList.contains('popup')) {
				return new DOMRect(0, 0, 300, 200);
			}
			return new DOMRect(triggerLeft, 100, 40, 20);
		});

		const component = mount(Tooltip, { target: document.body });
		const tooltip = document.body.querySelector('.tooltip')!;
		const popup = document.body.querySelector<HTMLElement>('.popup')!;
		await tick();
		tooltip.dispatchEvent(new MouseEvent('mouseenter'));
		await tick();
		await tick();

		expect(popup.dataset.positioned).toBe('true');
		expect(popup.style.left).toBe('92px');

		triggerLeft = 10;
		document.dispatchEvent(new Event('scroll'));
		await tick();
		expect(popup.style.left).toBe('8px');

		vi.restoreAllMocks();
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
		await unmount(component);
	});
});
