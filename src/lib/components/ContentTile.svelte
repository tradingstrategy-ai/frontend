<script lang="ts">
	import { Button, SocialIcon } from '$lib/components';

	export let title: string;
	export let icon: string;
	export let targetUrl: string;
	export let buttonLabel: string | undefined = undefined;
	export let external = false;

	$: tag = buttonLabel ? 'div' : 'a';
</script>

<svelte:element this={tag} class="tile" href={tag === 'a' ? targetUrl : undefined}>
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
		gap: 2rem;
		border: 2px solid var(--c-border-2-v1);
		border-radius: 0.5rem;
		padding: 2.5rem 1.5rem;
		text-align: center;
		--social-icon-size: 4rem;
		--social-icon-scale: 0.6;

		@media (--viewport-md-up) {
			--social-icon-size: 4.75rem;
		}
	}

	.header {
		display: grid;
		gap: 1rem;
		justify-items: center;
	}

	.tile[href]:hover h3 {
		text-decoration: underline;
	}

	.text :global {
		flex: 1;
		display: grid;
		gap: 2rem;
		align-content: start;
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		& * {
			font: inherit;
		}
	}
</style>
