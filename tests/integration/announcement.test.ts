import { type Page, expect, test } from '@playwright/test';
import { type ParsableDate, parseDate } from '$lib/helpers/date';

function setAnnouncementCookie(page: Page, date: ParsableDate) {
	const isoDateStr = parseDate(date)!.toISOString();
	return page.context().addCookies([
		{
			name: 'announcement-dismissed-at',
			value: encodeURIComponent(isoDateStr),
			domain: 'localhost',
			path: '/'
		}
	]);
}

test.describe('announcement banner', () => {
	test('should not be displayed if not yet published', async ({ page }) => {
		await page.clock.setFixedTime(new Date('2024-10-30T00:00:00Z'));
		await page.goto('/');
		const announcement = page.getByText('This is an example announcement.');
		await expect(announcement).not.toBeVisible();
	});

	test('should not be displayed if expired', async ({ page }) => {
		await page.clock.setFixedTime(new Date('2024-12-01T06:00:00Z'));
		await page.goto('/');
		const announcement = page.getByText('This is an example announcement.');
		await expect(announcement).not.toBeVisible();
	});

	test('should not be displayed if dismissed after published', async ({ page }) => {
		await setAnnouncementCookie(page, '2024-11-02T00:00:00Z');
		await page.clock.setFixedTime(new Date('2024-11-02T06:00:00Z'));
		await page.goto('/');
		const announcement = page.getByText('This is an example announcement.');
		await expect(announcement).not.toBeVisible();
	});

	test('should be displayed if dismissed before published', async ({ page }) => {
		await setAnnouncementCookie(page, '2024-10-31T00:00:00Z');
		await page.clock.setFixedTime(new Date('2024-11-02T06:00:00Z'));
		await page.goto('/');
		const announcement = page.getByText('This is an example announcement.');
		await expect(announcement).toBeVisible();
	});

	test.describe('published, not expired or dismissed', () => {
		test.beforeEach(async ({ page }) => {
			await page.clock.setFixedTime(new Date('2024-11-01T06:00:00Z'));
			await page.goto('/');
		});

		test('should be displayed', async ({ page }) => {
			const announcement = page.getByText('This is an example announcement.');
			await expect(announcement).toBeVisible();
		});

		test('should be dismissed when cancel button is clicked', async ({ page }) => {
			await page.getByRole('button', { name: 'Dismiss announcement' }).click();
			const announcement = page.getByText('This is an example announcement.');
			await expect(announcement).not.toBeVisible();
		});

		test('should set cookie when cancel button is clicked', async ({ page }) => {
			await page.getByRole('button', { name: 'Dismiss announcement' }).click();
			const cookies = await page.context().cookies();
			const cookie = cookies.find((c) => c.name === 'announcement-dismissed-at');
			expect(cookie?.value).toBe(encodeURIComponent('2024-11-01T06:00:00.000Z'));
		});

		test('should be dismissed when CTA button is clicked', async ({ page }) => {
			await page.getByRole('link', { name: 'View blog post' }).click();
			const announcement = page.getByText('This is an example announcement.');
			await expect(announcement).not.toBeVisible();
		});

		test('should be dismissed when a content link is clicked', async ({ page }) => {
			await page.getByRole('link', { name: 'latest blog post' }).click();
			const announcement = page.getByText('This is an example announcement.');
			await expect(announcement).not.toBeVisible();
		});

		test('should not be dismissed when non-linked content is clicked', async ({ page }) => {
			const content = page.getByText('This is an example announcement.');
			await content.click();

			// wait for potential exit transition to complete before verifying content is still present
			await page.waitForTimeout(1000);
			await expect(content).toBeVisible();
		});
	});
});
