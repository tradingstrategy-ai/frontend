import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Search from './Search.svelte';

// use mock tradingEntities store so it doesn't try to make real search requests
// see: src/lib/search/__mocks__/trading-entities.ts
vi.mock('./trading-entities');

// There's no easy way in vitest / testing library to apply and test the effects of CSS.
// For now, using the implementation detail that hasFocus class is set / not set.
describe('Search component', () => {
	test('should not display results by default', async () => {
		const { getByTestId } = render(Search);
		expect(getByTestId('nav-search')).not.toHaveClass('hasFocus');
	});

	test('should show results when desktop search field receives focus', async () => {
		const { getByLabelText, getByTestId } = render(Search);
		getByLabelText('search-desktop').focus();
		await waitFor(() => {
			expect(getByTestId('nav-search')).toHaveClass('hasFocus');
		});
	});

	test('should show results when mobile search label is clicked', async () => {
		const user = userEvent.setup();
		const { getByTestId, getByLabelText } = render(Search);
		await user.click(getByLabelText('search-mobile'));
		await waitFor(() => {
			expect(getByTestId('nav-search')).toHaveClass('hasFocus');
		});
	});

	test('should submit form when user hits enter', async () => {
		const user = userEvent.setup();
		const searchBox = render(Search).getByLabelText('search-desktop') as HTMLFormElement;
		const formSubmitHandler = vi.fn();

		searchBox.form.onsubmit = formSubmitHandler;
		searchBox.focus();
		await user.keyboard('eth{Enter}');
		expect(formSubmitHandler).toHaveBeenCalled();
	});
});
