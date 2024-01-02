<script lang="ts">
	import { Tooltip } from '$lib/components';

	export let label: string;
	export let title: string;
</script>

<Tooltip>
	<span slot="trigger" class="flag underline">
		{label}
	</span>

	<div slot="popup" class="tooltip-content">
		<h4>{title}</h4>
		<slot />
	</div>
</Tooltip>

<style lang="postcss">
	.flag {
		color: hsl(var(--hsl-textlight));
	}

	.tooltip-content {
		h4 {
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--f-heading-xs-spacing, normal);
		}

		:global(p) {
			margin-top: 1em;
		}
	}
</style>
