<script lang="ts">
	import { Icon } from '$lib/components';
	export let href = '';
	export let iconName = '';
	export let iconSize = '2rem';
	export let title = '';
	export let subtitle = '';
	export let summaryLabel = '';
	export let summaryValue = '';

	$: tag = href ? 'a' : 'div';
</script>

<svelte:element this={tag} {href} class="content-card tile b">
	{#if iconName}
		<div class="icon tile c" style="--icon-size: {iconSize}">
			<Icon size={iconSize} name={iconName} />
		</div>
	{/if}
	{#if title || $$slots.title}
		<h3 class="title">
			<slot name="title">
				{title}
			</slot>
		</h3>
	{/if}
	{#if subtitle || $$slots.subtitle}
		<p class="subtitle">
			<slot name="subtitle">
				{subtitle}
			</slot>
		</p>
	{/if}
	<div class="summary">
		<div class="label">
			{summaryLabel}
		</div>
		<div class="value">
			{summaryValue}
		</div>
	</div>
	{#if $$slots.cta}
		<div class="cta"><slot name="cta" /></div>
	{/if}
</svelte:element>

<style lang="postcss">
	.content-card {
		display: grid;
		gap: var(--space-lg);
		padding: var(--space-lg);
	}

	.content-card .icon {
		border-radius: 100%;
		padding: var(--space-ls);
		justify-self: start;
	}

	.content-card .summary {
		display: grid;
		gap: var(--space-xs);

		& .label {
			color: hsl(var(--hsl-v2-text-extra-light));
			font: var(--f-ui-sm-medium);
		}

		& .value {
			font: var(--f-ui-xxl-medium);
		}
	}
</style>
