<script lang="ts">
	import SocialIcon from './SocialIcon.svelte';
	import Button from './Button.svelte';

	export let title: string;
	export let icon: string;
	export let targetUrl: string;
	export let buttonLabel: string = undefined;
	export let horizontal = false;
	export let external = false;

	$: tag = buttonLabel ? 'div' : 'a';
</script>

<svelte:element this={tag} class="tile" class:horizontal href={tag === 'a' ? targetUrl : undefined}>
	<div class="header">
		<SocialIcon name={icon} />
		<h3>{title}</h3>
	</div>
	<div class="content">
		<div class="text"><slot /></div>

		{#if buttonLabel}
			<div class="button"><Button {external} label={buttonLabel} href={targetUrl} /></div>
		{/if}
	</div>
</svelte:element>

<style>
	.tile {
		--social-icon-size: 4rem;
		--social-icon-scale: 0.6;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		border: 2px solid var(--c-border-2);
		border-radius: 0.5rem;
		padding: 2.5rem 1.5rem;
		text-align: center;
	}

	.header {
		display: grid;
		gap: 1rem;
		justify-items: center;
	}

	.header h3 {
		padding-inline: 4rem;
	}

	.tile[href]:hover h3 {
		text-decoration: underline;
	}

	.content {
		display: grid;
		gap: 2rem;
	}

	.text {
		display: grid;
		gap: 2rem;
		font: 400 var(--fs-ui-lg);
	}

	.text :global * {
		font: inherit;
	}

	@media (--viewport-md-up) {
		.tile {
			--social-icon-size: 4.75rem;
		}

		.horizontal {
			--social-icon-size: 5rem;
			flex-direction: row;
			align-items: center;
		}

		.horizontal > * {
			flex: 1;
		}

		.horizontal .content {
			gap: 2rem;
			text-align: left;
		}

		.horizontal .text {
			gap: 1.5rem;
		}

		.horizontal h3 {
			padding-inline: 2.5rem;
		}
	}
</style>
