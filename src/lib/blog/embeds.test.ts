import { describe, expect, it } from 'vitest';
import { getYouTubeVideoId, renderYouTubeFacade, transformPostHtml } from './embeds';

const ghostYouTube =
	'<figure class="kg-card kg-embed-card"><iframe width="200" height="113" src="https://www.youtube.com/embed/PWNJyuylDv8?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Episode #12: Atoma"></iframe></figure>';

describe('getYouTubeVideoId', () => {
	it('recognises the embed hosts', () => {
		expect(getYouTubeVideoId('https://www.youtube.com/embed/PWNJyuylDv8?feature=oembed')).toBe('PWNJyuylDv8');
		expect(getYouTubeVideoId('https://www.youtube-nocookie.com/embed/PWNJyuylDv8')).toBe('PWNJyuylDv8');
		expect(getYouTubeVideoId('//youtube.com/embed/abc_-123')).toBe('abc_-123');
	});

	it('ignores other players', () => {
		expect(getYouTubeVideoId('https://open.spotify.com/embed/episode/xyz')).toBeNull();
		expect(getYouTubeVideoId('https://www.youtube.com/watch?v=PWNJyuylDv8')).toBeNull();
		expect(getYouTubeVideoId(null)).toBeNull();
	});
});

describe('transformPostHtml', () => {
	it('replaces a Ghost YouTube embed with a facade inside its figure', () => {
		const html = transformPostHtml(ghostYouTube);
		expect(html).not.toContain('<iframe');
		expect(html).toContain('<figure class="kg-card kg-embed-card"><a class="youtube-facade"');
		expect(html).toContain('href="https://www.youtube.com/watch?v=PWNJyuylDv8"');
		expect(html).toContain('data-video-id="PWNJyuylDv8"');
		expect(html).toContain('src="https://i.ytimg.com/vi/PWNJyuylDv8/hqdefault.jpg"');
		expect(html).toContain('alt="Episode #12: Atoma"');
		expect(html).toContain('loading="lazy"');
	});

	it('tolerates attribute order, single quotes and the nocookie host', () => {
		const html = transformPostHtml(
			`<iframe allowfullscreen src='https://www.youtube-nocookie.com/embed/abc123XYZ' title='T'></iframe>`
		);
		expect(html).toContain('data-video-id="abc123XYZ"');
		expect(html).toContain('data-video-title="T"');
	});

	it('lazy-loads other iframes and leaves explicit loading attributes alone', () => {
		expect(transformPostHtml('<iframe src="https://open.spotify.com/embed/episode/x" height="152"></iframe>')).toBe(
			'<iframe loading="lazy" src="https://open.spotify.com/embed/episode/x" height="152"></iframe>'
		);
		const eager = '<iframe loading="eager" src="https://example.com/"></iframe>';
		expect(transformPostHtml(eager)).toBe(eager);
	});

	it('leaves markup without iframes untouched', () => {
		const html = '<p>Hello <strong>world</strong></p><img src="/x.png">';
		expect(transformPostHtml(html)).toBe(html);
	});

	it('does not double-escape entities in Ghost titles', () => {
		const html = transformPostHtml(
			'<iframe src="https://www.youtube.com/embed/abc123XYZ" title="Research &amp; trading"></iframe>'
		);
		expect(html).toContain('alt="Research &amp; trading"');
		expect(html).not.toContain('&amp;amp;');
	});

	it('escapes attribute values in the facade', () => {
		expect(renderYouTubeFacade('abc', 'A "quoted" <title>')).toContain('alt="A &quot;quoted&quot; &lt;title&gt;"');
	});
});
