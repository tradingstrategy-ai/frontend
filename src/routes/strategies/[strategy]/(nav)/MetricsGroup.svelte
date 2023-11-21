<script lang="ts">
	export let title: string;
</script>

<div class="metrics-group">
	<h2>{title}</h2>
	<dl>
		<slot />
	</dl>
</div>

<style lang="postcss">
	.metrics-group {
		display: grid;
		gap: 1rem;
		background: hsl(var(--hsla-box-1));
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	h2 {
		font: 600 1rem / var(--lh-display) var(--ff-heading);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--hsl-text-ultra-light));
	}

	dl {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;

		> :global(div) {
			display: grid;
			gap: 0.375rem;
		}

		:global(dt) {
			font: var(--f-ui-sm-medium);
			color: hsl(var(--hsl-text-light));
		}

		:global(dd) {
			font: var(--f-ui-xxl-medium);
		}
	}
</style>
