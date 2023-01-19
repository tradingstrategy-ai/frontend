import { vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Timestamp from './Timestamp.svelte';

describe('Timestamp component', () => {
	const date = new Date('2023-01-01T12:00Z');

	test('should render fallback string if no valid date supplied', () => {
		const { getByText } = render(Timestamp, { date: undefined });
		getByText('---');
	});

	test('should render human readable date string by default', () => {
		const { getByText } = render(Timestamp, { date });
		getByText('Sun Jan 01 2023');
	});

	test('should append relative value when requested', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2023-01-15T12:00Z');

		const { getByText } = render(Timestamp, { date, withRelative: true });
		getByText('Sun Jan 01 2023, 14 days ago');

		vi.useRealTimers();
	});

	test('should render iso date string', () => {
		const { getByText, queryByText } = render(Timestamp, { date, format: 'iso' });
		getByText('2023-01-01');
		expect(queryByText('12:00')).toBeNull();
	});

	test('should render iso date with time', () => {
		const { getByText } = render(Timestamp, { date, format: 'ISO', withTime: true });
		getByText('2023-01-01');
		getByText('12:00');
	});

	test('should render iso date with time including seconds', () => {
		const { getByText } = render(Timestamp, { date, format: 'iso', withSeconds: true });
		getByText('2023-01-01');
		getByText('12:00:00');
	});

	test('should render relative date string', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2023-01-15T12:00Z');

		const timeEl = render(Timestamp, { date, format: 'relative' }).container.querySelector('time');

		expect(timeEl).toHaveAttribute('datetime', date.toISOString());
		expect(timeEl).toHaveTextContent('14 days ago');

		vi.useRealTimers();
	});

	test('should parse ISO date string', () => {
		const { getByText } = render(Timestamp, { date: '2022-12-02T16:53Z', format: 'iso', withTime: true });
		getByText('2022-12-02');
		getByText('16:53');
	});

	test('should parse JS-style numeric date value', () => {
		const { getByText } = render(Timestamp, { date: 1670000000000, format: 'iso', withTime: true });
		getByText('2022-12-02');
		getByText('16:53');
	});

	test('should parse JS-style numeric value provided as string', () => {
		const { getByText } = render(Timestamp, { date: '1670000000000', format: 'iso', withTime: true });
		getByText('2022-12-02');
		getByText('16:53');
	});

	test('should parse unix epoch numeric value', () => {
		const { getByText } = render(Timestamp, { date: 1670000000, format: 'iso', withTime: true });
		getByText('2022-12-02');
		getByText('16:53');
	});

	test('should parse unix epoch string value', () => {
		const { getByText } = render(Timestamp, { date: '1670000000', format: 'iso', withTime: true });
		getByText('2022-12-02');
		getByText('16:53');
	});
});
