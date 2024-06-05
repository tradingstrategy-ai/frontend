<script lang="ts">
	import { Icon, Tooltip } from '$lib/components';

	export let title: string;
	export let details: string;
</script>

<Tooltip>
	<span slot="trigger">
		<span class="check">
			<Icon name="success" />
		</span>
		{title}
		<span class="question">
			<Icon name="question-circle" />
		</span>
	</span>
	<div slot="popup">
		{details}
	</div>
</Tooltip>

<style lang="postcss">
	[slot='trigger'] {
		display: flex;
		gap: 0.75ex;
		align-items: center;
		color: color-mix(in srgb, var(--c-bullish), var(--c-text) 25%);

		span {
			display: grid;
		}

		.check {
			--icon-size: 1.25em;
			:global(svg) {
				overflow: visible;
			}

			:global(path) {
				stroke-width: 2.5px;
			}
		}

		.question {
			opacity: 0.8;
		}
	}

	[slot='popup'] {
		max-width: 24rem;
	}
</style>
