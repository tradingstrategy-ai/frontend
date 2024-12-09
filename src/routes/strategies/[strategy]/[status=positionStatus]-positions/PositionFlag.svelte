<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { DataBadge, Tooltip } from '$lib/components';

	type Props = {
		label: string;
		title: string;
		status?: ComponentProps<DataBadge>['status'];
		children: Snippet;
	};

	let { label, title, status = 'default', children }: Props = $props();
</script>

<Tooltip>
	<span slot="trigger" class="flag targetable-above">
		<DataBadge {status}>{label}</DataBadge>
	</span>

	<div slot="popup" class="tooltip-content">
		<h4>{title}</h4>
		{@render children()}
	</div>
</Tooltip>

<style>
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
			margin-bottom: 0.75rem;
			font: var(--f-heading-xs-medium);
			letter-spacing: var(--f-heading-xs-spacing, normal);
		}

		:global(p) {
			margin-top: 1em;
		}
	}
</style>
