import { vi } from 'vitest';
import { render } from '@testing-library/svelte';
import Timestamp from './Timestamp.svelte';

describe('Timestamp component', () => {
	const date = new Date('2023-01-01T12:00Z');

	test('should render fallback string if no valid date supplied', () => {
		const { getByText } = render(Timestamp, { date: undefined });
		getByText('---');
	});

	test('should render iso date string by default', () => {
		const { getByText, queryByText } = render(Timestamp, { date });
		getByText('2023-01-01');
		expect(queryByText('12:00')).toBeNull();
	});

	test('should render iso date with time', () => {
		const { container } = render(Timestamp, { date, withTime: true });
		const timeEl = container.querySelector('time');
		// getByText does not search across inline HTML tags; use toHaveTextContent instead
		// note: space between date and time is injected via CSS
		expect(timeEl).toHaveTextContent('2023-01-0112:00');
	});

	test('should render iso date with time including seconds', () => {
		const { container } = render(Timestamp, { date, withSeconds: true });
		const timeEl = container.querySelector('time');
		// getByText does not search across inline HTML tags; use toHaveTextContent instead
		// note: space between date and time is injected via CSS
		expect(timeEl).toHaveTextContent('2023-01-0112:00:00');
	});

	test('should render relative date string', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2023-01-15T12:00Z');

		const timeEl = render(Timestamp, { date, relative: true }).container.querySelector('time');

		expect(timeEl).toHaveAttribute('datetime', date.toISOString());
		expect(timeEl).toHaveTextContent('14 days ago');

		vi.useRealTimers();
	});
});
