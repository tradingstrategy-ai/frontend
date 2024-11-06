import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { default as AnnouncementBanner, dismissed } from './AnnouncementBanner.svelte';

const announcementProps = {
	title: 'Great annoucement',
	description: 'We have something important to share!',
	ctaLabel: 'Click here',
	href: 'https://example.com',
	publishAt: new Date('2024-11-01T00:00:00Z'),
	expireAt: new Date('2024-12-01T00:00:00Z'),
	dismissedAt: undefined
};

describe('AnnouncementBanner component', () => {
	beforeEach(() => {
		vi.useFakeTimers();

		// stub requestAnimationFrame due to JSDom limitations; see:
		// https://testing-library.com/docs/svelte-testing-library/faq#why-arent-transition-events-running
		vi.stubGlobal('requestAnimationFrame', (fn: Function) => {
			setTimeout(() => fn(new Date()), 16);
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
		dismissed.set(false);
	});

	test('should be empty if not yet published', () => {
		vi.setSystemTime('2024-10-31T23:59:59Z');
		const { container } = render(AnnouncementBanner, announcementProps);
		expect(container.childElementCount).toBe(0);
	});

	test('should be empty if expired', () => {
		vi.setSystemTime('2024-12-01T00:00:01Z');
		const { container } = render(AnnouncementBanner, announcementProps);
		expect(container.childElementCount).toBe(0);
	});

	test('should have content if published and not yet expired', () => {
		vi.setSystemTime('2024-11-01T00:00:01Z');
		const { container } = render(AnnouncementBanner, announcementProps);
		expect(container.childElementCount).not.toBe(0);
	});

	test('should have content if published and never expires', () => {
		vi.setSystemTime('2024-11-01T00:00:01Z');
		const { container } = render(AnnouncementBanner, {
			...announcementProps,
			expireAt: undefined
		});
		expect(container.childElementCount).not.toBe(0);
	});

	test('should be empty if dismissed after published', () => {
		vi.setSystemTime('2024-11-01T00:00:02Z');
		const { container } = render(AnnouncementBanner, {
			...announcementProps,
			dismissedAt: new Date('2024-11-01T00:00:02Z')
		});
		expect(container.childElementCount).toBe(0);
	});

	test('should have content if dismissed before published', () => {
		vi.setSystemTime('2024-11-01T00:00:01Z');
		const { container } = render(AnnouncementBanner, {
			...announcementProps,
			dismissedAt: new Date('2024-10-31T23:59:59Z')
		});
		expect(container.childElementCount).not.toBe(0);
	});

	test('should be empty if dismissed after publishAd', () => {
		vi.setSystemTime('2024-11-01T00:02:00Z');
		const { container } = render(AnnouncementBanner, {
			...announcementProps,
			dismissedAt: new Date('2024-11-01T00:01:00Z')
		});
		expect(container.childElementCount).toBe(0);
	});

	test('should be dismissed when cancel button is clicked', async () => {
		vi.setSystemTime('2024-11-01T00:01:00Z');
		const { container, getByRole } = render(AnnouncementBanner, announcementProps);
		const cancelButton = getByRole('button', { name: 'Dismiss announcement' });
		await fireEvent.click(cancelButton);
		vi.advanceTimersByTime(1000);
		expect(container.childElementCount).toBe(0);
	});

	test('should be dismissed when CTA button is clicked', async () => {
		vi.setSystemTime('2024-11-01T00:01:00Z');
		const { container, getByRole } = render(AnnouncementBanner, announcementProps);
		const ctaButton = getByRole('link', { name: 'Click here' });
		await fireEvent.click(ctaButton);
		vi.advanceTimersByTime(1000);
		expect(container.childElementCount).toBe(0);
	});

	test('should be dismissed when a content link is clicked', async () => {
		vi.setSystemTime('2024-11-01T00:01:00Z');
		const { container, getByRole } = render(AnnouncementBanner, {
			...announcementProps,
			description: `Here's a <a href="https://foo.com">content link</a>`
		});
		const contentLink = getByRole('link', { name: 'content link' });
		await fireEvent.click(contentLink);
		vi.advanceTimersByTime(1000);
		expect(container.childElementCount).toBe(0);
	});

	test('should not be dismissed when non-linked content is clicked', async () => {
		vi.setSystemTime('2024-11-01T00:01:00Z');
		const { container, getByText } = render(AnnouncementBanner, {
			...announcementProps,
			description: 'Not a link'
		});
		const content = getByText('Not a link');
		await fireEvent.click(content);
		vi.advanceTimersByTime(1000);
		expect(container.childElementCount).not.toBe(0);
	});

	test('should stay dismissed between renders', async () => {
		vi.setSystemTime('2024-11-01T00:01:00Z');
		const { getByRole, unmount } = render(AnnouncementBanner, announcementProps);
		const cancelButton = getByRole('button', { name: 'Dismiss announcement' });
		await fireEvent.click(cancelButton);
		unmount();
		const { container } = render(AnnouncementBanner, announcementProps);
		expect(container.childElementCount).toBe(0);
	});
});
