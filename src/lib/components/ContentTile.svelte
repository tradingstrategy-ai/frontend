<script lang="ts">
	import SocialIcon from './SocialIcon.svelte';
	import Button from './Button.svelte';

	export let title: string;
	export let icon: string;
	export let targetUrl: string;
	export let buttonLabel: string = undefined;
	export let horizontal = false;

	let button: HTMLElement;

	// ignore clicks on the tile anchor when button is shown
	function handleTileClick(event: MouseEvent) {
		const buttonVisible = button.offsetParent !== null;
		const buttonClicked = button.contains(<Node>event.target);
		if (buttonVisible && !buttonClicked) event.preventDefault();
	}
</script>

<a class:horizontal href={targetUrl} on:click={handleTileClick}>
	<div class="header">
		<SocialIcon name={icon} />
		<h3>{title}</h3>
	</div>
	<div class="content">
		<div class="text"><slot /></div>

		{#if buttonLabel}
			<div bind:this={button} class="button"><Button label={buttonLabel} href={targetUrl} /></div>
		{/if}
	</div>
</a>

<style>
	a {
		display: grid;
		gap: 2rem;
		border: 2px solid var(--c-border-1);
		padding: 2.8rem 1.5rem;
		text-align: center;
		--social-icon-size: 64px;
	}

	.header {
		display: grid;
		justify-items: center;
	}

	a h3 {
		margin-top: 1rem;
		padding: 0 4rem;
	}

	a:hover h3 {
		text-decoration: underline;
	}

	.content {
		display: grid;
		gap: 2rem;
	}

	.text {
		display: grid;
		gap: 1rem;
		font: 400 var(--fs-ui-md);
		letter-spacing: 0.01em;
	}

	@media (--viewport-md-up) {
		.horizontal {
			grid-template-columns: 1fr 1fr;
			align-items: center;
			cursor: default;
		}

		.horizontal .content {
			gap: 1rem;
			text-align: left;
		}

		.horizontal h3 {
			padding: 0;
		}

		.horizontal:hover h3 {
			text-decoration: none;
		}
	}
</style>
