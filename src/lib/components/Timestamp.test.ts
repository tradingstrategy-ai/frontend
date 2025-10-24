import { vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Timestamp from './Timestamp.svelte';
import TimestampWithSnippet from './Timestamp.test.svelte';

describe('Timestamp component', () => {
	const date = new Date('2023-01-01T12:00Z');

	test('should render fallback string if no valid date supplied', () => {
		render(Timestamp, { date: undefined });
		screen.getByText('---');
	});

	test('should render iso date string by default', () => {
		render(Timestamp, { date });
		screen.getByText('2023-01-01');
		expect(screen.queryByText('12:00')).toBeNull();
	});

	test('should render iso date with time', () => {
		const { container } = render(Timestamp, { date, withTime: true });
		const timeEl = container.querySelector('time');
		// getByText does not search across inline HTML tags; use toHaveTextContent instead
		expect(timeEl).toHaveTextContent('2023-01-01 12:00');
	});

	test('should render iso date with time including seconds', () => {
		const { container } = render(Timestamp, { date, withSeconds: true });
		const timeEl = container.querySelector('time');
		// getByText does not search across inline HTML tags; use toHaveTextContent instead
		expect(timeEl).toHaveTextContent('2023-01-01 12:00:00');
	});

	test('should render relative date string', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2023-01-15T12:00Z');

		const { container } = render(Timestamp, { date, relative: true });
		const timeEl = container.querySelector('time');

		expect(timeEl).toHaveAttribute('datetime', date.toISOString());
		expect(timeEl).toHaveTextContent('14 days ago');

		vi.useRealTimers();
	});

	describe('Svelte 5 snippet syntax', () => {
		test('should render custom content with snippet using all props', () => {
			vi.useFakeTimers();
			vi.setSystemTime('2023-01-15T12:00Z');

			const { container } = render(TimestampWithSnippet, { date, testId: 'full-snippet' });
			const timeEl = container.querySelector('time');

			expect(timeEl).toHaveAttribute('datetime', date.toISOString());
			// Check that custom snippet content is rendered with all available data
			expect(timeEl).toHaveTextContent('Date: 2023-01-01 Time: 12:00 Relative: 14 days ago');

			vi.useRealTimers();
		});

		test('should render custom content with snippet using partial props', () => {
			const { container } = render(TimestampWithSnippet, { date, testId: 'partial-snippet' });
			const timeEl = container.querySelector('time');

			// Check that snippet can access and use individual props
			expect(timeEl).toHaveTextContent('Sunday, January 1, 2023');
		});

		test('should render default content when no snippet provided', () => {
			const { container } = render(TimestampWithSnippet, { date, testId: 'no-snippet' });
			const timeEl = container.querySelector('time');

			// Should fall back to default rendering
			expect(timeEl).toHaveTextContent('2023-01-01');
		});
	});
});
