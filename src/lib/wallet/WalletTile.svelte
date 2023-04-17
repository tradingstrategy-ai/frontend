<script lang="ts">
	import { getLogoUrl } from '$lib/helpers/assets';

	export let name: string;
	export let slug: string;
</script>

<button class="wallet-tile tile a" on:click>
	<img alt={name} src={getLogoUrl(slug)} />
	<div class="text">
		<h3>{name}</h3>
		<p><slot /></p>
	</div>
</button>

<style lang="postcss">
	.wallet-tile {
		border: 2px hsla(var(--hsl-box), var(--a-box-a)) solid;
		border-radius: var(--radius-sm);
		cursor: pointer;
		display: grid;
		gap: var(--space-lg);
		grid-template-rows: 7.5rem 1fr;
		justify-items: center;
		align-items: flex-start;
		padding: var(--space-ls) var(--space-md);
		outline: none;

		&:focus {
			background: hsla(var(--hsl-box), var(--a-box-c));
			--background-hover: hsla(var(--hsl-box), var(--a-box-d));
		}
	}

	img {
		height: 100%;
	}

	.text {
		display: grid;
		text-align: center;
	}

	h3 {
		font: var(--f-ui-xl-medium);
	}
</style>
