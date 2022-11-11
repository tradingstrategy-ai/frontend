import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import RangeFilter, { generateOptions, getLabel, getFilter } from './RangeFilter.svelte';

const defaultProps = {
	fieldName: 'age',
	breakpoints: [0, 18, 65, Infinity]
};

describe('RangeFilter component', () => {
	test('should render checkbox options', () => {
		const { getAllByRole } = render(RangeFilter, defaultProps);
		expect(getAllByRole('checkbox')).toHaveLength(3);
	});

	test('should pre-check selected items', () => {
		const { getByRole } = render(RangeFilter, {
			...defaultProps,
			selected: ['18-65']
		});
		expect(getByRole('checkbox', { name: '18 - 65' })).toBeChecked();
	});

	test('checking an option should fire component change event', async () => {
		const { getByRole, component } = render(RangeFilter, defaultProps);

		const handleChange = vi.fn();
		component.$on('change', handleChange);

		const checkbox = getByRole('checkbox', { name: '0 - 18' });
		await fireEvent.click(checkbox);

		const expected = { fieldName: 'age', filter: 'age:>=0 && age:<18' };
		expect(handleChange).toHaveBeenCalledOnce();
		expect(handleChange.calls[0][0]).toHaveProperty('detail', expected);
	});

	describe('generateOptions module function', () => {
		test('should generate n-1 options for n breakpoints', () => {
			expect(generateOptions([0, 100, 1000])).toHaveLength(2);
			expect(generateOptions([Infinity, 1000, 100, 0])).toHaveLength(3);
		});

		test('should generate valid options for ascending breakpoints', () => {
			const options = generateOptions([0, 100, Infinity]);
			expect(options[0]).toStrictEqual({ label: '0 - 100', value: '0-100' });
			expect(options[1]).toStrictEqual({ label: '> 100', value: '100-Infinity' });
		});

		test('should generate valid options for descending breakpoints', () => {
			const options = generateOptions([Infinity, 100, 0]);
			expect(options[0]).toStrictEqual({ label: '> 100', value: 'Infinity-100' });
			expect(options[1]).toStrictEqual({ label: '0 - 100', value: '100-0' });
		});
	});

	describe('getLabel module function', () => {
		test('should return appropriate "X - Y" label for finite range', () => {
			expect(getLabel([0, 100])).toBe('0 - 100');
		});

		test('should return "> X" label for infinite positive range', () => {
			expect(getLabel([100, Infinity])).toBe('> 100');
		});

		test('should return "< Y" label for infinite negative range', () => {
			expect(getLabel([100, -Infinity])).toBe('< 100');
		});

		test('should use custom formatter if provided', () => {
			const formatter = vi.fn((n) => `<${n}>`);
			expect(getLabel([0, 100], formatter)).toBe('<0> - <100>');
			expect(formatter).toHaveBeenCalledTimes(2);
		});
	});

	describe('getFilter module function', () => {
		test('should be undefined for no values', () => {
			expect(getFilter('foo', [])).toBeUndefined();
		});

		test('should return finite range filter for single finite range', () => {
			expect(getFilter('foo', ['0-100'])).toEqual('foo:>=0 && foo:<100');
		});

		test('should return finite range filter for multiple finite ranges', () => {
			expect(getFilter('foo', ['0-100', '100-1000'])).toEqual('foo:>=0 && foo:<1000');
		});

		test('should return infinite range filter for single infinite range', () => {
			expect(getFilter('foo', ['1000-Infinity'])).toEqual('foo:>=1000');
		});

		test('should return infinite range filter for hybred finite/infinite ranges', () => {
			expect(getFilter('foo', ['100-1000', '1000-Infinity'])).toEqual('foo:>=100');
		});
	});
});
