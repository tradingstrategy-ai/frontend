<script lang="ts">
	import { Icon } from '$lib/components';

	export let title: string;
	export let details: string;
</script>

<li>
	<h3>
		<Icon name="success" />
		{title}
	</h3>
	<div class="details">
		{details}
	</div>
</li>

<style lang="postcss">
	li {
		display: grid;
		justify-items: center;

		h3 {
			--icon-size: 1.25em;
			display: flex;
			gap: 0.75ex;
			align-items: center;
			margin: 0;
			color: color-mix(in srgb, var(--c-bullish), var(--c-text) 25%);

			:global(svg) {
				overflow: visible;
			}

			:global(path) {
				stroke-width: 2.5px;
			}
		}

		.details {
			max-width: 24em;
			margin-top: 0.75em;
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing);
		}
	}
</style>
