<script lang="ts">
	import { Button } from '$lib/components';

	export let status: number;
	export let title: string;
	export let details: string = '';
</script>

<section class="ds-container">
	<h1>{status}</h1>
	<h2>{title}</h2>

	{#if details}
		<p>{details}</p>
	{/if}

	<div class="buttons">
		<slot />
		<Button secondary label="Get help on Discord" icon="discord" href="https://discord.gg/en8tW6MDtw" target="_blank" />
	</div>
</section>

<style lang="postcss">
	section {
		grid-row: 2 / 3;
		display: grid;
		justify-items: center;
		align-content: center;
		overflow-y: auto;
		text-align: center;

		& h1 {
			font: 900 160px var(--ff-display);

			@media (--viewport-sm-down) {
				font-size: 120px;
			}
		}

		& h2 {
			font: var(--f-h3-roman);
		}

		& p {
			margin-top: 1rem;
			max-width: 50ch;
			font: var(--f-ui-large-roman);
		}
	}

	.buttons {
		display: grid;
		grid-auto-flow: column;
		gap: 1.25rem;
		margin-top: 1.75rem;

		@media (--viewport-xs) {
			grid-auto-flow: row;
		}
	}
</style>
