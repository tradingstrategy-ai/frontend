<!--
@component
Display a content tile that links to additional content, such as the blog tiles
on the blog roll. If `href` is included, the entire tile is a targetable CTA.
A `ctaLabel` or `cta` slot may also be provided to include an explicit button target.

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
	export let href: string | undefined = undefined;
	export let mediaSrc = '';
	export let mediaAlt = '';
	export let title = '';

	$: tag = href ? 'a' : 'div';

	let ctaEl: HTMLElement;
	$: buttonEl = ctaEl?.querySelector('.button') as HTMLElement;
</script>

<svelte:element
	this={tag}
	class="content-tile tile a {classes}"
	{href}
	on:mouseover={() => buttonEl?.focus()}
	on:mouseleave={() => buttonEl?.blur()}
	on:focus={() => buttonEl?.focus()}
>
	<img src={mediaSrc} alt={mediaAlt} />

	<div class="content">
		<div class="info">
			{#if datetime}
				<Timestamp {datetime} showDistanceToNow />
			{/if}

			{#if title}
				<h3 class="truncate lines-3">{title}</h3>
			{/if}

			{#if description}
				<p class="truncate lines-3">{description}</p>
			{/if}
		</div>

		{#if $$slots.cta || ctaLabel}
			<div class="cta" bind:this={ctaEl}>
				<slot name="cta">
					<Button label={ctaLabel} {href} />
				</slot>
			</div>
		{/if}
	</div>
</svelte:element>

<style lang="postcss">
	.content-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		grid-auto-rows: auto 1fr;
		overflow: hidden;
		place-content: stretch;
	}

	img {
		width: 100%;
		height: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		background: hsla(var(--hsl-box), var(--a-box-b));

		@media (--viewport-sm-up) {
			max-height: 20rem;
		}

		@media (--viewport-xs) {
			height: min(16rem, 28vh);
		}
	}

	.content {
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

	.info {
		display: grid;
		gap: var(--content-gap);

		& :global time {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: hsl(var(--hsl-text-extra-light));
		}

		& h3 {
			margin: 0;
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		& p {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: hsl(var(--hsl-text-light));
		}
	}

	.cta {
		margin-top: var(--space-sm);
		display: grid;
	}
</style>
