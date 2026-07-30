import { render, screen } from '@testing-library/svelte';
import Search from './Search.svelte';

describe('Search component', () => {
	test('renders the labelled search form', () => {
		render(Search);

		const searchBox = screen.getByRole('combobox', { name: 'Search vaults and DeFi entities' });
		expect(searchBox).toHaveAttribute('placeholder', 'Search vaults');
		expect(searchBox.form).toHaveAttribute('action', '/search');
	});
});
