import { vi } from 'vitest';
import { render } from '@testing-library/svelte';
import DateTime from './DateTime.svelte';

describe('DateTime component', () => {
	const date = new Date('2023-01-01T12:00Z');

	test('should render fallback string if no valid date or epoch supplied', () => {
		const { getByText } = render(DateTime);
		getByText('---');
	});

	test('should render absolute date and time with valid date prop', () => {
		const { getByText } = render(DateTime, { date });
		getByText('2023-01-01');
		getByText('12:00');
	});

	test('should include seconds when withSeconds=true', () => {
		const { getByText } = render(DateTime, { date, withSeconds: true });
		getByText('2023-01-01');
		getByText('12:00:00');
	});

	test('should render relative date/time when relative=true', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2023-01-15T12:00Z');

		const timeEl = render(DateTime, { date, relative: true }).container.querySelector('time');

		expect(timeEl).toHaveAttribute('datetime', date.toISOString());
		expect(timeEl).toHaveTextContent('14 days ago');

		vi.useRealTimers();
	});

	test('should correctly convert unix epoch prop', () => {
		const { getByText } = render(DateTime, { epoch: 1670000000 });
		getByText('2022-12-02');
		getByText('16:53');
	});
});
