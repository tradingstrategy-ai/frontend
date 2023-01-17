<!-- 
	@component
Display a content tile that links to additional content, such as those on
Trading data or Community pages. The entire tile can be a targetable CTA, or
(if `buttonLabel`) provided, the tile can display a button CTA.

#### Usage:
```tsx
	<ContentTile
		ctaLabel="Read article"
		href="/blog/{post.slug}"
		mediaSrc={post.feature_image}
		mediaAlt={post.feature_image_alt}
		title={post.title}
		datetime={new Date(post.published_at)}
		description={post.excerpt}
	/>
```
 -->
<script lang="ts">
	import Timestamp from './Timestamp.svelte';
	import Button from './Button.svelte';

	let classes = '';
	export { classes as class };
	export let ctaLabel = '';
	export let datetime = new Date();
	export let description = '';
	export let href = '';
	export let mediaSrc = '';
	export let mediaAlt = '';
	export let title = '';

	$: tag = href ? 'a' : 'div';

	$: anchorProps = {
		href: href ?? null
	};

	let cardEl: HTMLElement;

	const handleHighlight = () => {
		const ctaButton = cardEl.querySelector('.cta .button') as HTMLElement;
		ctaButton?.focus();
	};

	const handleUnhighlight = () => {
		const ctaButton = cardEl.querySelector('.cta .button') as HTMLElement;
		ctaButton?.blur();
	};
</script>

<svelte:element
	this={tag}
	{...anchorProps}
	class="content-tile tile a {classes}"
	bind:this={cardEl}
	on:mouseover={handleHighlight}
	on:mouseleave={handleUnhighlight}
	on:focus={handleHighlight}
>
	<div class="media">
		<img src={mediaSrc} alt={mediaAlt} />
	</div>
	<div class="content">
		<div class="info">
			{#if datetime}
				<Timestamp {datetime} showDistanceToNow />
			{/if}
			{#if title || $$slots.title}
				<slot name="title">
					<h3 class="title truncate lines-3">{title}</h3>
				</slot>
			{/if}

			{#if description || $$slots.description}
				<slot name="description">
					<p class="description truncate lines-3">
						{description}
					</p>
				</slot>
			{/if}
		</div>

		{#if $$slots.cta || ctaLabel}
			<div class="cta">
				<slot name="cta">
					<Button {href}>
						{ctaLabel}
					</Button>
				</slot>
			</div>
		{/if}
	</div>
</svelte:element>

<style lang="postcss" global>
	.content-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		grid-auto-rows: auto 1fr;
		overflow: hidden;
		place-content: stretch;
	}

	.content-tile .media {
		background: hsla(var(--hsl-box), var(--a-box-b));
		@media (--viewport-sm-up) {
			min-height: 20rem;
		}
		@media (--viewport-md-down) {
			height: min(16rem, 28vh);
		}

		& img {
			height: 100%;
			object-fit: cover;
			width: 100%;
		}
	}

	.content-tile h3 {
		font: var(--f-heading-md-medium) !important;
	}

	.content-tile .content {
		--content-gap: var(--space-sl);
		--content-padding: var(--space-ll) var(--space-lg);
		@media (--viewport-sm-down) {
			--content-gap: var(--space-ss);
			--content-padding: var(--space-ls) var(--space-ml);
		}
		display: grid;
		gap: var(--content-gap);
		padding: var(--content-padding);
		place-content: space-between center;
	}

	.content-tile .info {
		display: grid;
		gap: var(--content-gap);
	}

	.content-tile :global time {
		color: hsl(var(--hsl-text-extra-light));
		font: var(--f-ui-sm-medium);
	}

	.content-tile .title {
		margin: 0;
	}

	.content-tile .description {
		color: hsl(var(--hsl-text-light));
		font: var(--f-ui-md-roman);
	}

	.content-tile .cta {
		margin-top: var(--space-sm);

		& .button {
			width: 100%;
		}
	}
</style>
