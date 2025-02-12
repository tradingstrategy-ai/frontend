import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Search from './Search.svelte';

// use mock tradingEntities store so it doesn't try to make real search requests
// see: src/lib/search/__mocks__/trading-entities.ts
vi.mock('$lib/search/trading-entities');

// There's no easy way in vitest / testing library to apply and test the effects of CSS.
// For now, using the implementation detail that hasFocus class is set / not set.
describe('Search component', () => {
	test('should submit form when user hits enter', async () => {
		const user = userEvent.setup();
		render(Search);
		const searchBox = screen.getByLabelText('search-desktop') as HTMLFormElement;
		const formSubmitSpy = vi.fn();
		searchBox.form.onsubmit = formSubmitSpy;

		searchBox.focus();
		await user.keyboard('eth{Enter}');
		expect(formSubmitSpy).toHaveBeenCalled();
	});
});
