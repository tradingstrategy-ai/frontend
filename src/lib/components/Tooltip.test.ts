import { render } from '@testing-library/svelte';
import Tooltip from './Tooltip.svelte';

describe('Tooltip component', () => {
	// This test is intentionally checking for very specific markup:
	// The tooltip popup container MUST be a button element; otherwise
	// you end up with illegal element nesting which leads to page jank
	// (the popup content is not hidden on initial page render).
	// see: https://stackoverflow.com/questions/40531029 updates 3 & 4
	test('should use button tag for popup content', () => {
		const { container } = render(Tooltip);
		const popup = container.querySelector('.popup');
		expect(popup?.tagName).toBe('BUTTON');
		// button should be disabled to remove from tab index and prevent click events
		expect(popup).toBeDisabled();
	});
});
