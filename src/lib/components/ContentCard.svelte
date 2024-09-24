<!--
@component
Display a card with icon, title, description and an optional CTA button. The entire card acts as an
anchor if `href` is provided. The `icon` and `cta` slots are optional.

### Usage:
```tsx
	<ContentCard title="Content card 1" href="/destination/page">
		<IconFoo slot="icon" />
		<p>More information about the content card</p>
		<Button slot="cta" label="Learn more" />
	</ContentCard>
```
-->
<script lang="ts">
	export let title: string | undefined = undefined;
	export let href: string | undefined = undefined;
	export let target: string | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let testId: string | undefined = undefined;

	$: tag = href ? 'a' : 'div';

	$: anchorProps = { href, rel, target };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<svelte:element this={tag} {...anchorProps} class="content-card tile b" data-testid={testId} on:click>
	{#if $$slots.icon}
		<div class="icon tile c">
			<slot name="icon" />
		</div>
	{/if}

	<slot name="title">
		<h3>{title}</h3>
	</slot>

	<div class="description">
		<slot />
	</div>

	{#if $$slots.cta}
		<div class="cta">
			<slot name="cta" />
		</div>
	{/if}
</svelte:element>

<style>
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

		.icon {
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
			--button-width: 100%;
		}

		@media (--viewport-md-up) {
			margin-top: var(--space-sm);
		}
	}
</style>
