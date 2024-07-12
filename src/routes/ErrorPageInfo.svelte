<script lang="ts">
	import { discordUrl } from '$lib/config';
	import { Button } from '$lib/components';
	import IconDiscord from '~icons/local/discord';

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
		<Button secondary label="Get help on Discord" href={discordUrl} target="_blank" rel="noreferrer">
			<IconDiscord slot="icon" />
		</Button>
	</div>
</section>

<style lang="postcss">
	section {
		display: grid;
		justify-items: center;
		align-content: center;
		overflow-y: auto;
		text-align: center;

		h1 {
			font: 900 160px var(--ff-display);

			@media (--viewport-sm-down) {
				font-size: 120px;
			}
		}

		h2 {
			font: var(--f-h3-roman);
		}

		p {
			margin-top: var(--space-md);
			max-width: 50ch;
			font: var(--f-ui-large-roman);
		}
	}

	.buttons {
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-ls);
		margin-top: var(--space-ll);

		@media (--viewport-xs) {
			grid-auto-flow: row;
		}
	}
</style>
