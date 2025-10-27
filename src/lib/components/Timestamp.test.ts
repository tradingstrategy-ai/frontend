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
		const { container } = render(Timestamp, { date, withTime: 'seconds' });
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

	describe('relative time options', () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime('2023-01-15T12:00Z');
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		test('should render relative time with default options (non-strict, with suffix)', () => {
			const { container } = render(Timestamp, { date, relative: true });
			const timeEl = container.querySelector('time');

			expect(timeEl).toHaveAttribute('datetime', date.toISOString());
			// Non-strict includes "about"
			expect(timeEl).toHaveTextContent('14 days ago');
		});

		test('should render relative time without suffix', () => {
			const { container } = render(Timestamp, { date, relative: { addSuffix: false } });
			const timeEl = container.querySelector('time');

			// Should have "about" but no "ago"
			expect(timeEl?.textContent).toMatch(/14 days$/);
			expect(timeEl?.textContent).not.toMatch(/ago/);
		});

		test('should render strict relative time with suffix', () => {
			const { container } = render(Timestamp, { date, relative: { strict: true } });
			const timeEl = container.querySelector('time');

			// Strict format removes "about", keeps "ago"
			expect(timeEl).toHaveTextContent('14 days ago');
			expect(timeEl?.textContent).not.toMatch(/about/);
		});

		test('should render strict relative time without suffix', () => {
			const { container } = render(Timestamp, { date, relative: { strict: true, addSuffix: false } });
			const timeEl = container.querySelector('time');

			// Strict format, no approximations, no suffix
			expect(timeEl).toHaveTextContent('14 days');
			expect(timeEl?.textContent).not.toMatch(/about/);
			expect(timeEl?.textContent).not.toMatch(/ago/);
		});

		test('should treat empty object same as true', () => {
			const { container } = render(Timestamp, { date, relative: {} });
			const timeEl = container.querySelector('time');

			// Should behave same as relative={true}
			expect(timeEl).toHaveTextContent('14 days ago');
		});

		test('should not render relative when relative is false', () => {
			const { container } = render(Timestamp, { date, relative: false });
			const timeEl = container.querySelector('time');

			// Should render date, not relative
			expect(timeEl).toHaveTextContent('2023-01-01');
			expect(timeEl?.textContent).not.toMatch(/ago/);
		});

		test('should not render relative when relative is undefined', () => {
			const { container } = render(Timestamp, { date });
			const timeEl = container.querySelector('time');

			// Should render date, not relative
			expect(timeEl).toHaveTextContent('2023-01-01');
			expect(timeEl?.textContent).not.toMatch(/ago/);
		});
	});

	describe('Svelte 5 snippet syntax', () => {
		test('should render custom content with snippet using all props', () => {
			vi.useFakeTimers();
			vi.setSystemTime('2023-01-15T12:00Z');

			const { container } = render(TimestampWithSnippet, { date, testId: 'full-snippet' });
			const timeEl = container.querySelector('time');

			expect(timeEl).toHaveAttribute('datetime', date.toISOString());
			// Check that custom snippet content is rendered with all available data (note: relativeStr now)
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
