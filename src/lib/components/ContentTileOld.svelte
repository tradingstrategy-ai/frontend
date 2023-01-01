<!--
@component
Display a content tile that links to additional content, such as those on
Trading data or Community pages. The entire tile can be a targetable CTA, or
(if `buttonLabel`) provided, the tile can display a button CTA.

#### Usage:
```tsx
	<ContentTileOld title="Twitter" icon="twitter" targetUrl="https://twitter.com/TradingProtocol">
		Follow us on Twitter for trading alerts, DeFi insight and protocol news.
	</ContentTileOld>
```
-->
<script lang="ts">
	import { Button, SocialIcon } from '$lib/components';

	export let title: string;
	export let icon: string;
	export let targetUrl: string | undefined = undefined;
	export let buttonLabel: string | undefined = undefined;
	export let external = false;

	$: targetable = !buttonLabel;
	$: tag = targetable && targetUrl ? 'a' : 'div';
	$: href = tag === 'a' ? targetUrl : undefined;
</script>

<svelte:element this={tag} class="tile" class:targetable {href} on:click>
	<div class="header">
		<SocialIcon name={icon} />
		<h3>{title}</h3>
	</div>

	<div class="text"><slot /></div>

	{#if buttonLabel}
		<div class="button"><Button {external} label={buttonLabel} href={targetUrl} /></div>
	{/if}
</svelte:element>

<style lang="postcss">
	.tile {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		border: 2px solid var(--c-border-2-v1);
		border-radius: var(--radius-xs);
		padding: 2.5rem var(--space-lg);
		text-align: center;
		--social-icon-size: 4rem;
		--social-icon-scale: 0.6;

		@media (--viewport-md-up) {
			--social-icon-size: 4.75rem;
		}
	}

	.header {
		display: grid;
		gap: var(--space-md);
		justify-items: center;
	}

	.targetable:hover {
		cursor: pointer;

		& h3 {
			text-decoration: underline;
		}
	}

	.text :global {
		flex: 1;
		display: grid;
		gap: var(--space-xl);
		align-content: start;
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		& * {
			font: inherit;
		}
	}
</style>
