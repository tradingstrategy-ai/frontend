import { render, screen } from '@testing-library/svelte';
import { default as SortSelect, getSortParams } from './SortSelect.svelte';

describe('SortSelect component', () => {
	test('should render a drop-down with sort options', () => {
		render(SortSelect);
		expect(screen.getAllByRole('option')).toHaveLength(6);
	});

	test('should select first option by default', () => {
		render(SortSelect);
		screen.getByRole('option', { name: '▼ TVL', selected: true });
	});

	test('should select option matching the value prop', () => {
		render(SortSelect, { value: 'volume:desc' });
		screen.getByRole('option', { name: '▼ Volume', selected: true });
	});

	test('should default to first option if value does not match any options', () => {
		render(SortSelect, { value: 'foo:bar' });
		screen.getByRole('option', { name: '▼ TVL', selected: true });
	});

	describe('getSortParams module function', () => {
		test('should return params for matching option', () => {
			expect(getSortParams('volume:desc')).toStrictEqual(['volume_24h:desc', 'pair_swap_fee:asc', '_text_match:desc']);
		});

		test('should return default params for non-matching option', () => {
			expect(getSortParams('foo:bar')).toStrictEqual(['tvl:desc', 'liquidity:desc', '_text_match:desc']);
		});
	});
});
