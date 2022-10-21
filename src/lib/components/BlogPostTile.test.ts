import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import BlogPostTile from './BlogPostTile.svelte';

describe('BlogPostTile', () => {
	const props = {
		slug: 'amazing_blog_post',
		title: 'Amazing Blog Post',
		excerpt: 'Some truly amazing content!',
		imageUrl: 'http://some.image.url',
		imageAltText: 'Amazing image',
		publishedAt: '2022-06-14T12:00:00Z'
	};

	test('should render a link to the blog target URL', () => {
		const link = render(BlogPostTile, props).getByRole('link');
		expect(link).toHaveAttribute('href', '/blog/amazing_blog_post');
	});

	test('should include image with correct src and alt attributes', () => {
		const img = render(BlogPostTile, props).getByRole('img');
		expect(img).toHaveAttribute('src', props.imageUrl);
		expect(img).toHaveAttribute('alt', props.imageAltText);
	});

	test('should include time element with absolute and relative time', () => {
		vi.useFakeTimers();
		vi.setSystemTime('2022-07-01');

		const timeEl = render(BlogPostTile, props).getByRole('link').querySelector('time');
		expect(timeEl).toHaveAttribute('datetime', props.publishedAt);
		expect(timeEl).toHaveTextContent(/Tue Jun 14 2022/);
		expect(timeEl).toHaveTextContent(/17 days ago/);

		vi.useRealTimers();
	});
});
