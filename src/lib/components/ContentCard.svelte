<!--
@component
Display a card with icon, title, description and an optional CTA button. The entire card acts as an
anchor if `href` is provided. Use default `slot` instead of `description` when addional markup or
logic is required. Use `slot="cta"` instead of `ctaLabel` when custom button options are required.

### Usage:
```tsx
	<ContentCard
		title="Content card 1"
		icon="newspaper"
		ctaLabel="Click here"
		href="/destination/page"
		description="More information about the content card"
	>
		<p>Optional slot content overrides description prop</p>
	</ContentCard>
```
-->
<script lang="ts">
	import { Button, Icon } from '$lib/components';

	export let ctaLabel = '';
	export let ctaFullWidth = false;
	export let description = '';
	export let icon: string | undefined = undefined;
	export let href = '';
	export let title: string | undefined = undefined;

	$: tag = href ? 'a' : 'div';

	$: anchorProps = {
		href
	};
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element this={tag} {...anchorProps} class="content-card tile b" class:ctaFullWidth on:click>
	{#if icon || $$slots.icon}
		<div class="icon symbol tile c">
			<slot name="icon">
				<Icon name={`${icon}`} />
			</slot>
		</div>
	{/if}

	<slot name="title">
		<h3>{title}</h3>
	</slot>

	<div class="description">
		<slot>{description}</slot>
	</div>

	{#if $$slots.cta || ctaLabel}
		<div class="cta">
			<slot name="cta">
				<Button label={ctaLabel} />
			</slot>
		</div>
	{/if}
</svelte:element>

<style lang="postcss">
	.content-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);

		@media (--viewport-xs) {
			padding: var(--space-ls);
		}

		@media (--viewport-sm-up) {
			gap: var(--space-ml);
		}

		* {
			margin-bottom: 0;
		}

		.symbol {
			--icon-size: var(--content-tile-icon-size, 1.75rem);
			border-radius: 100%;
			display: flex;
			padding: var(--space-ls);
			margin-bottom: var(--space-md);
			place-self: start;

			@media (--viewport-sm-up) {
				margin-bottom: var(--space-ml);
			}
		}

		:global h3 {
			font: var(--f-heading-lg-medium);

			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
			}
		}

		.description {
			flex: 1;
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}

			:global(p) {
				margin-bottom: 1.25em;
				font: inherit;
				letter-spacing: inherit;

				&:last-child {
					margin-bottom: 0;
				}
			}
		}
	}

	.cta {
		@media (--viewport-sm-down) {
			:global .button {
				width: 100%;
			}
		}

		@media (--viewport-md-up) {
			margin-top: var(--space-sm);
		}

		.ctaFullWidth & :global .button {
			width: 100%;
		}
	}
</style>
