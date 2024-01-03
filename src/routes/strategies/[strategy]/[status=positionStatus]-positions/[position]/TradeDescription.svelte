<script lang="ts">
	import { DataBadge } from '$lib/components';

	export let actionLabel: string;
	export let positionImpact: string | undefined;
	export let isTest = false;
</script>

<div class="trade-description">
	<span class="label">
		{actionLabel}
	</span>
	{#if positionImpact}
		<span class="position-impact">
			{positionImpact}
		</span>
	{/if}
	{#if isTest}
		<span class="test-badge">
			<DataBadge status="warning">TEST</DataBadge>
		</span>
	{/if}
</div>

<style lang="postcss">
	.trade-description {
		display: flex;
		gap: 1ex;
		align-items: center;
		white-space: nowrap;

		.position-impact {
			color: hsl(var(--hsl-text-extra-light));
		}

		.test-badge {
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--ls-ui-xs);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xxs-medium);
				letter-spacing: var(--ls-ui-xxs);
			}
		}
	}
</style>
