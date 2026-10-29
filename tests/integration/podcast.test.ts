import { expect, test } from '@playwright/test';
import { PODCAST_EPISODE_COUNT } from '../mocks/ghost/posts.mock';

// Every episode must be in the initial HTML, without scrolling or loading more.
test.use({ javaScriptEnabled: false });

test('shows all podcast episodes on one page, including those beyond the Ghost API page limit', async ({ page }) => {
	await page.goto('/podcast');

	const episodeList = page.getByTestId('blog-roll');
	await expect(episodeList.getByRole('heading')).toHaveText(
		Array.from({ length: PODCAST_EPISODE_COUNT }, (_, index) => {
			const episode = PODCAST_EPISODE_COUNT - index;
			return `${episode <= 4 ? 'Podcast' : 'Episode'} #${episode}: Test podcast`;
		})
	);
	await expect(episodeList.getByRole('heading', { name: 'Test post with embeds' })).toHaveCount(0);
	await expect(
		episodeList.getByRole('heading', { name: 'Trading Strategy interview at Citizen Cosmos podcast' })
	).toHaveCount(0);
	await expect(episodeList.getByRole('link', { name: 'Podcast #1: Test podcast', exact: true })).toHaveAttribute(
		'href',
		/\/blog\/podcast-episode-1$/
	);
});
