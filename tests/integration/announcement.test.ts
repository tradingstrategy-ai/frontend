import { type Page, expect, test } from '@playwright/test';
import { type ParsableDate, parseDate } from '$lib/helpers/date';

function setAnnouncementCookie(page: Page, date: ParsableDate) {
	const isoDateStr = parseDate(date)!.toISOString();
	return page.context().addCookies([
		{
			name: 'podcast-announcement-dismissed-at',
			value: encodeURIComponent(isoDateStr),
			domain: 'localhost',
			path: '/'
		}
	]);
}

test.describe('announcement banner', () => {
	test('is not displayed on the landing page', async ({ page }) => {
		await page.goto('/');
		const announcement = page.getByText('We have started the Trading Strategy podcast.');
		await expect(announcement).not.toBeVisible();
	});

	test.describe('on pages other than the landing page', () => {
		test.beforeEach(async ({ page }) => {
			await page.goto('/vaults');
		});

		test('is displayed with a link to the podcast page', async ({ page }) => {
			const announcement = page.getByText('We have started the Trading Strategy podcast.');
			await expect(announcement).toBeVisible();
			await expect(page.getByRole('link', { name: 'Listen to us on YouTube and Spotify.' })).toHaveAttribute(
				'href',
				'/podcast'
			);
		});

		test('is dismissed when the cancel button is clicked', async ({ page }) => {
			await page.getByRole('button', { name: 'Dismiss announcement' }).click();
			const announcement = page.getByText('We have started the Trading Strategy podcast.');
			await expect(announcement).not.toBeVisible();
		});

		test('sets a cookie when dismissed', async ({ page }) => {
			await page.getByRole('button', { name: 'Dismiss announcement' }).click();
			const cookies = await page.context().cookies();
			const cookie = cookies.find((c) => c.name === 'podcast-announcement-dismissed-at');
			expect(cookie?.value).toBeTruthy();
		});

		test('is not displayed after a dismissal', async ({ page }) => {
			await setAnnouncementCookie(page, '2026-09-02T00:00:00Z');
			await page.reload();
			await expect(page.getByText('We have started the Trading Strategy podcast.')).not.toBeVisible();
		});

		test('dismisses when the podcast link is clicked', async ({ page }) => {
			await page.getByRole('link', { name: 'Listen to us on YouTube and Spotify.' }).click();
			await page.waitForURL('**/podcast');
			const cookies = await page.context().cookies();
			expect(cookies.some((cookie) => cookie.name === 'podcast-announcement-dismissed-at')).toBe(true);
		});
	});
});
