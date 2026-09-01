import { render, screen } from '@testing-library/svelte';
import Search from './Search.svelte';

describe('Search component', () => {
	test('renders the labelled search form', () => {
		render(Search);

		const searchBox = screen.getByRole('combobox', { name: 'Search vaults and DeFi entities' });
		expect(searchBox).toHaveAttribute('placeholder', 'Search vaults');
		expect(searchBox.closest('form')).toHaveAttribute('action', '/search');
	});

	test('supports page formatting and vault-selector copy', () => {
		render(Search, {
			format: 'page',
			scope: 'vaults',
			label: 'Add vaults',
			inputLabel: 'Search vaults to compare',
			placeholder: 'Search by vault name or address',
			showAllResults: false,
			disabled: true
		});

		const searchBox = screen.getByRole('combobox', { name: 'Search vaults to compare' });
		expect(searchBox).toHaveAttribute('placeholder', 'Search by vault name or address');
		expect(searchBox).toBeDisabled();
		expect(screen.getByText('Add vaults')).toBeVisible();
		expect(screen.getByTestId('page-search')).toContainElement(searchBox);
	});
});
