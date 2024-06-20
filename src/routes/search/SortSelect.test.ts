import { render } from '@testing-library/svelte';
import SortSelect, { getSortParams } from './SortSelect.svelte';

describe('SortSelect component', () => {
	test('should render a drop-down with sort options', () => {
		const { getAllByRole } = render(SortSelect);
		expect(getAllByRole('option')).toHaveLength(6);
	});

	test('should select first option by default', () => {
		const { getByRole } = render(SortSelect);
		getByRole('option', { name: '▼ TVL', selected: true });
	});

	test('should select option matching the value prop', () => {
		const { getByRole } = render(SortSelect, { value: 'volume:desc' });
		getByRole('option', { name: '▼ Volume', selected: true });
	});

	test('should default to first option if value does not match any options', () => {
		const { getByRole } = render(SortSelect, { value: 'foo:bar' });
		getByRole('option', { name: '▼ TVL', selected: true });
	});

	describe('getSortParams module function', () => {
		test('should return params for matching option', () => {
			expect(getSortParams('volume:desc')).toStrictEqual(['volume_24h:desc', 'pair_swap_fee:asc', '_text_match:desc']);
		});

		test('should return default params for non-matching option', () => {
			expect(getSortParams('foo:bar')).toStrictEqual(['tvl:desc', 'pair_swap_fee:asc', '_text_match:desc']);
		});
	});
});
