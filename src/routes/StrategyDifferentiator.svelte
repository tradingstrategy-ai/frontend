<script lang="ts">
	import { Tooltip } from '$lib/components';
	import IconSuccess from '~icons/local/success';
	import IconQuestionCircle from '~icons/local/question-circle';

	export let title: string;
	export let details: string;
</script>

<Tooltip>
	<span slot="trigger">
		<IconSuccess />
		{title}
		<IconQuestionCircle />
	</span>
	<div slot="popup">
		{details}
	</div>
</Tooltip>

<style>
	[slot='trigger'] {
		display: flex;
		gap: 0.75ex;
		align-items: center;
		color: color-mix(in srgb, var(--c-bullish), var(--c-text) 25%);

		:global .icon.success {
			--icon-size: 1.25em;
			overflow: visible;

			path {
				stroke-width: 2.5px;
			}
		}

		:global .icon.question-circle {
			opacity: 0.8;
		}
	}

	[slot='popup'] {
		max-width: 24rem;
	}
</style>
