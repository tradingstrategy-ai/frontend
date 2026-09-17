/**
 * Server-side rewrite of the embeds in a Ghost post body.
 *
 * Ghost emits third-party players as plain `<iframe>`s. A YouTube embed alone pulls ~1.6 MB
 * of player JavaScript before the article's own cover image paints (lab LCP 16.7 s in the
 * 2026-09 audit), so YouTube iframes are replaced with a facade — a poster image and a
 * play button inside a fixed 16:9 box — that `BlogPostContent.svelte` swaps for the real
 * player on click. Every other iframe (Spotify, Apple Podcasts, …) is lazy-loaded.
 *
 * The input is Ghost's own markup, so a tag-level regex is enough; a full HTML parser is
 * not warranted for this.
 */

const IFRAME_PATTERN = /<iframe\b([^>]*)>(?:\s*<\/iframe>)?/gi;
const SRC_PATTERN = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const TITLE_PATTERN = /\btitle\s*=\s*(?:"([^"]*)"|'([^']*)')/i;
const YOUTUBE_EMBED_PATTERN =
	/^(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([A-Za-z0-9_-]{6,})/i;

export const YOUTUBE_FACADE_CLASS = 'youtube-facade';

/** Escape the characters that matter inside an HTML attribute value. */
function escapeAttribute(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Extract the YouTube video id from an embed URL, or `null` for anything else. */
export function getYouTubeVideoId(src: string | null | undefined): string | null {
	if (!src) return null;
	return src.match(YOUTUBE_EMBED_PATTERN)?.[1] ?? null;
}

/**
 * Markup of the click-to-load YouTube facade.
 *
 * The wrapper fixes the 16:9 aspect ratio so swapping the poster for the player cannot
 * shift the layout; the 4:3 `hqdefault` poster is centre-cropped by CSS. `hqdefault` is
 * used rather than `maxresdefault` because the latter does not exist for every video.
 *
 * @param videoId YouTube video id
 * @param title accessible name, from the iframe's `title` when Ghost sets one
 */
export function renderYouTubeFacade(videoId: string, title = 'YouTube video'): string {
	const id = escapeAttribute(videoId);
	const label = escapeAttribute(title);
	return (
		`<a class="${YOUTUBE_FACADE_CLASS}" href="https://www.youtube.com/watch?v=${id}" data-video-id="${id}" data-video-title="${label}" target="_blank" rel="noopener">` +
		`<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="${label}" width="480" height="360" loading="lazy" decoding="async">` +
		`<span class="play" aria-hidden="true"></span>` +
		`<span class="sr-only">Play video: ${label}</span>` +
		`</a>`
	);
}

/**
 * Rewrite the embeds of a Ghost post body; see the module comment.
 *
 * @param html post `html` as returned by the Ghost content API
 */
export function transformPostHtml(html: string): string {
	return html.replace(IFRAME_PATTERN, (tag: string, attributes: string) => {
		const srcMatch = attributes.match(SRC_PATTERN);
		const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3];
		const videoId = getYouTubeVideoId(src);

		if (videoId) {
			const titleMatch = attributes.match(TITLE_PATTERN);
			return renderYouTubeFacade(videoId, titleMatch?.[1] ?? titleMatch?.[2] ?? undefined);
		}

		if (/\bloading\s*=/i.test(attributes)) return tag;
		return tag.replace(/<iframe\b/i, '<iframe loading="lazy"');
	});
}
