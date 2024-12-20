import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SearchPanel from './SearchPanel.svelte';

// use mock tradingEntities store so it doesn't try to make real search requests
// see: src/lib/search/__mocks__/trading-entities.ts
vi.mock('$lib/search/trading-entities');

const defaultProps = {
	q: '',
	sortBy: 'liquidity',
	hasSearch: false,
	loading: false
};

describe('SearchPanel component', () => {
	test('should display "search for" fallback when no search criteria', async () => {
		render(SearchPanel, defaultProps);
		screen.getByText('Search exchanges, tokens, trading pairs and lending reserves.');
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	test('should display "no results" fallback when no results found', async () => {
		render(SearchPanel, {
			...defaultProps,
			hasSearch: true,
			hits: []
		});
		screen.getByText('No results found', { exact: false });
		expect(screen.queryAllByRole('listitem')).toHaveLength(0);
	});

	test('should display results when results found', async () => {
		render(SearchPanel, {
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
		expect(screen.queryByText('No results found', { exact: false })).toBeNull();
		expect(screen.queryByText('Search exchanges, tokens and trading pairs.')).toBeNull();
		expect(screen.queryAllByRole('listitem')).toHaveLength(1);
	});

	test('search field should lose focus when "Enter" key is pressed', async () => {
		const user = userEvent.setup();
		render(SearchPanel, defaultProps);
		const searchBox = screen.getByRole('searchbox');

		searchBox.focus();
		await user.keyboard('eth');
		expect(searchBox).toHaveFocus();

		await user.keyboard('{Enter}');
		expect(searchBox).not.toHaveFocus();
	});
});
