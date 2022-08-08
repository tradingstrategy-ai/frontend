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
			<div class="button"><Button external={external} label={buttonLabel} href={targetUrl} /></div>
		{/if}
	</div>
</svelte:element>

<style>
	.tile {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		border: 2px solid var(--c-border-1);
		padding: 2.5rem 1.5rem;
		text-align: center;
		--social-icon-size: 64px;
	}

	.header {
		display: grid;
		justify-items: center;
	}

	.header h3 {
		margin-top: 1rem;
		padding: 0 4rem;
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
		gap: 1rem;
		font: 400 var(--fs-ui-lg);
	}

	.text :global * {
		font: inherit;
	}

	@media (--viewport-md-up) {
		.horizontal {
			flex-direction: row;
			align-items: center;
		}

		.horizontal > * {
			flex: 1;
		}

		.horizontal .content {
			gap: 1rem;
			text-align: left;
		}

		.horizontal h3 {
			padding: 0;
		}
	}
</style>
