import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SearchPanel from './SearchPanel.svelte';

const defaultProps = {
	q: '',
	sortBy: 'liquidity',
	hasSearch: false
};

describe('SearchPanel component', () => {
	test('should display "search for" fallback when no search criteria', async () => {
		const { getByText, queryAllByRole } = render(SearchPanel, defaultProps);
		getByText('Search exchanges, tokens and trading pairs.');
		expect(queryAllByRole('listitem')).toHaveLength(0);
	});

	test('should display "no results" fallback when no results found', async () => {
		const { getByText, queryAllByRole } = render(SearchPanel, {
			...defaultProps,
			hasSearch: true,
			hits: []
		});
		getByText('No results found', { exact: false });
		expect(queryAllByRole('listitem')).toHaveLength(0);
	});

	test('should display results when results found', async () => {
		const { queryByText, queryAllByRole } = render(SearchPanel, {
			...defaultProps,
			hasSearch: true,
			hits: [
				{
					document: {
						id: 'token_1',
						type: 'token',
						description: 'USDC on Ethereum',
						url_path: '/trading-view/ethereum/tokens/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
					}
				}
			]
		});
		expect(queryByText('No results found', { exact: false })).toBeNull();
		expect(queryByText('Search exchanges, tokens and trading pairs.')).toBeNull();
		expect(queryAllByRole('listitem')).toHaveLength(1);
	});

	test('search field should lose focus when "Enter" key is pressed', async () => {
		const user = userEvent.setup();
		const searchBox = render(SearchPanel, defaultProps).getByRole('searchbox');
		searchBox.focus();

		await user.keyboard('eth');
		expect(searchBox).toHaveFocus();

		await user.keyboard('{Enter}');
		expect(searchBox).not.toHaveFocus();
	});
});
