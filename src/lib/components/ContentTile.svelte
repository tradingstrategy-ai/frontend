<script lang="ts">
	import Timestamp from './Timestamp.svelte';
	import Button from './Button.svelte';

	export let ctaLabel = '';
	export let datetime = new Date();
	export let description = '';
	export let href = '';
	export let mediaSrc = '';
	export let mediaAlt = '';
	export let title = '';
</script>

<div class="content-tile tile a">
	<div class="media">
		<img src={mediaSrc} alt={mediaAlt} />
	</div>
	<div class="content">
		{#if title || $$slots.title}
			<slot name="title">
				<h3 class="truncate lines-3">{title}</h3>
			</slot>
		{/if}

		<Timestamp {datetime} showDistanceToNow />

		{#if description || $$slots.description}
			<slot name="description">
				<p class="description truncate lines-3">
					{description}
				</p>
			</slot>
		{/if}

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
</div>

<style lang="postcss">
	.content-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		overflow: hidden;
	}

	.content-tile .media {
		background: hsla(var(--hsl-v2-box), var(--a-v2-box-b));
		min-height: 20rem;

		& img {
			height: 100%;
			object-fit: cover;
		}
	}

	:global h3 {
		font: var(--f-heading-md-medium) !important;
	}

	.content-tile .content {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-ll) var(--space-lg);
		place-content: center;
	}

	.content-tile .description {
		color: hsl(var(--hsl-v2-text-light));
		font: var(--f-ui-md-roman);
	}

	.content-tile .cta {
		margin-top: var(--space-sm);

		& :global(.button) {
			width: 100%;
		}
	}
</style>
