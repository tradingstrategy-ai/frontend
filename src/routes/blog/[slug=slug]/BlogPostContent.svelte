<script lang="ts">
	import { mount } from 'svelte';
	import { YOUTUBE_FACADE_CLASS } from '$lib/blog/embeds';
	import TableOfContents from './TableOfContents.svelte';

	interface Props {
		html: string;
	}

	let { html }: Props = $props();

	// Inject Table of Contents; to include TOC, add <div id="#table-of-contents"> to Ghost content
	function injectTOC(node: HTMLElement) {
		const target = node.querySelector('#table-of-contents');
		if (target) {
			const entries = node.querySelectorAll('h2, h3') as NodeListOf<HTMLHeadingElement>;
			mount(TableOfContents, { target, props: { entries } });
		}
	}

	/**
	 * Swap a YouTube facade (see `$lib/blog/embeds`) for the real player.
	 *
	 * The iframe is created inside the same 16:9 box the poster occupied, so nothing moves.
	 * Without JavaScript the facade is a plain link to the video on YouTube.
	 */
	function activateYouTubeFacade(event: MouseEvent) {
		const facade = (event.target as HTMLElement).closest<HTMLAnchorElement>(`a.${YOUTUBE_FACADE_CLASS}`);
		if (!facade || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		event.preventDefault();
		const iframe = document.createElement('iframe');
		iframe.src = `https://www.youtube-nocookie.com/embed/${facade.dataset.videoId}?autoplay=1`;
		iframe.title = facade.dataset.videoTitle ?? 'YouTube video';
		iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;
		iframe.className = YOUTUBE_FACADE_CLASS;
		facade.replaceWith(iframe);
		iframe.focus();
	}

	// Make tables mobile friendly by wrapping with container to allow horizontal scrolling
	function wrapTables(node: HTMLElement) {
		node.querySelectorAll('table').forEach((tableEl: HTMLTableElement) => {
			const wrapper = document.createElement('div');
			wrapper.classList.add('table-wrapper');
			tableEl.parentNode!.insertBefore(wrapper, tableEl);
			wrapper.appendChild(tableEl);
		});
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div class="blog-post-content" use:injectTOC use:wrapTables onclick={activateYouTubeFacade}>
	<!--  eslint-disable-next-line svelte/no-at-html-tags -->
	{@html html}
</div>

<style>
	.blog-post-content {
		--blog-post-font: var(--f-text-md-regular);
		--blog-post-letter-spacing: var(--f-text-md-spacing, normal);
		font: var(--blog-post-font);
		letter-spacing: (--blog-post-letter-spacing);
		overflow: auto;

		@media (--viewport-sm-up) {
			--blog-post-font: var(--f-text-lg-regular);
			--blog-post-letter-spacing: var(--f-text-lg-spacing, normal);
		}

		:global(:is(p, li)) {
			font: var(--blog-post-font);
			letter-spacing: (--blog-post-letter-spacing);
		}

		:global(p:not(:first-of-type)) {
			margin-top: 1.5rem;
		}

		:global(h1) {
			font: var(--f-heading-lg-medium);
			margin: 2.25rem 0 !important;
			text-transform: capitalize;
		}

		:global(> h2) {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
			margin: 3rem 0 1.5rem;
			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
			}
		}

		:global(> h3) {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
			margin: 2rem 0 1rem 0;
			@media (--viewport-xs) {
				font: var(--f-heading-sm-medium);
			}
		}

		:global(> h4) {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--f-heading-sm-spacing, normal);
			margin: 2rem 0 1rem 0;
			@media (--viewport-xs) {
				font: var(--f-heading-xs-medium);
			}
		}

		:global(:is(ol, ul)) {
			margin: 0;
		}

		:global(li) {
			margin: 0.5em 0 0 0;
			padding-left: 0.25rem;
		}

		:global(:is(a, a:hover)) {
			text-decoration: underline;
			color: inherit;
		}

		:global(:is(strong, b)) {
			font-weight: 600;
		}

		:global(figure) {
			display: grid;
			margin: 2.5rem 0 3rem;

			:global(img) {
				height: 100%;
				width: 100%;
			}
		}

		:global(figcaption) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			text-align: center;
			margin: 1rem 0;
			/* fix Firefox scroll issue due to Ghost-added `white-space: pre-wrap` property */
			overflow: hidden;

			:global(a) {
				font-weight: 500;
			}
		}

		:global(iframe) {
			border: 0;
			width: 100%;
			min-height: 450px;
		}

		/* click-to-load YouTube player; the box keeps its 16:9 size through the swap */
		:global(.youtube-facade) {
			display: block;
			position: relative;
			width: 100%;
			aspect-ratio: 16 / 9;
			min-height: 0;
			overflow: hidden;
			border-radius: var(--radius-sm);
			background: var(--c-box-3);

			:global(img) {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}

			:global(.play) {
				position: absolute;
				inset: 50% auto auto 50%;
				translate: -50% -50%;
				width: 4.25rem;
				height: 3rem;
				border-radius: 0.75rem;
				background: rgb(0 0 0 / 0.75);
				transition: background 0.2s;

				&::after {
					content: '';
					position: absolute;
					inset: 50% auto auto 50%;
					translate: -40% -50%;
					border-style: solid;
					border-width: 0.6rem 0 0.6rem 1.1rem;
					border-color: transparent transparent transparent white;
				}
			}

			&:hover :global(.play),
			&:focus-visible :global(.play) {
				background: rgb(255 0 0 / 0.9);
			}
		}

		:global(.kg-image-card) {
			text-align: center;
		}

		:global(.kg-image) {
			width: 100%;
			height: auto;
			max-width: 100%;
			display: inline-block;
		}

		:global(pre) {
			margin: 1.5rem 0;
			border-radius: var(--radius-sm);
			padding: 0.875rem 1.25rem;
			background: var(--c-terminal-bg);
			color: var(--c-terminal);
			font: var(--f-mono-sm-regular);
			letter-spacing: var(--f-mono-sm-spacing, normal);

			@media (--viewport-sm-up) {
				border-radius: var(--radius-md);
				padding: 1rem 1.5rem;
				font: var(--f-mono-md-regular);
				letter-spacing: var(--f-mono-md-spacing, normal);
			}
		}

		:global(blockquote) {
			margin: 1.5rem 0 1.5rem 0.75rem;
			padding: 1.5rem;
			font: var(--f-text-lg-regular);
			letter-spacing: var(--f-text-lg-spacing, normal);
			background: var(--c-quoteblock-background);
			box-shadow: -0.75rem 0.75rem 0 var(--c-quoteblock-backdrop);
		}

		:global(.table-wrapper) {
			overflow-x: auto;
			overflow-y: hidden;
		}

		:global(table) {
			margin-block: 1.5rem;
			border-collapse: collapse;
			color: inherit;
			background: var(--c-box-1);

			font: var(--f-mono-xs-regular);
			line-height: 1;

			@media (--viewport-xs) {
				font-size: 14px;
			}

			:global(a),
			:global(a:not(.does-not-exist)) {
				text-decoration: none;
				font-weight: bold;
			}

			:global(:is(td, th)) {
				padding: 0.25em 0.5em;
				border-block: 1px solid var(--c-text-ultra-light);
				vertical-align: top;

				&:first-child {
					padding-left: 0;
				}

				&:last-child {
					padding-right: 0;
				}
			}

			:global(:is(td)) {
				/* Alternating column colors */
				&:nth-child(even) {
					background-color: var(--c-box-3);
				}

				&:nth-child(odd) {
					background-color: var(--c-box-1);
				}
			}
			:global(th) {
				background: var(--c-box-3);
				font-weight: 900;
			}
		}

		/* JavaScript generated TOC */
		:global(#table-of-contents) {
			display: contents;
		}
	}
</style>
