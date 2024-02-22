<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { DataBadge, Tooltip } from '$lib/components';

	export let label: string;
	export let title: string;
	export let status: ComponentProps<DataBadge>['status'] = 'default';
</script>

<Tooltip>
	<span slot="trigger" class="flag">
		<DataBadge {status}>{label}</DataBadge>
	</span>

	<div slot="popup" class="tooltip-content">
		<h4>{title}</h4>
		<slot />
	</div>
</Tooltip>

<style lang="postcss">
	.flag {
		:global([data-css-props]) {
			--data-badge-background: var(--c-box-4);
		}

		:global(*) {
			text-decoration: dotted underline;
		}
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
