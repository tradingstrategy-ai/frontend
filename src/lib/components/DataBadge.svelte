<script lang="ts">
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'sm';
	export let status: 'bullish' | 'bearish' | 'error' | 'success' | 'warning' | 'default' = 'default';
	export let align: 'center' | 'left' | 'right' = 'left';
</script>

<span class="data-badge ds-3 {size} {status}" style:text-align={align}>
	<span>
		<slot />
	</span>
	{#if $$slots.additional}
		<span class="additional-value">
			<slot name="additional" />
		</span>
	{/if}
</span>

<style lang="postcss">
	.data-badge {
		background: hsla(var(--hsla-box-2));
		display: inline-grid;
		transition: var(--transition-1);

		span {
			align-items: center;
			display: flex;
			gap: 0.375rem;
		}

		.additional-value {
			margin-top: var(--badge-gap);
		}

		&:is(.xs, .sm) {
			font: var(--f-ui-sm-medium);
			--badge-gap: 0.25rem;
		}

		&.xs {
			border-radius: var(--radius-sm);
			padding: 0.375rem;
		}

		&.sm {
			border-radius: var(--radius-sl);
		}

		&:is(.sm, .md) {
			padding: 0.5rem;
		}

		&:is(.md, .lg) {
			border-radius: var(--radius-ms);
			font: var(--f-ui-md-medium);
			--badge-gap: 0.375rem;
		}

		&.lg {
			padding: 0.625rem;
		}

		&:is(.bullish, .success) {
			background: hsla(var(--hsl-bullish), 0.25);
			color: hsla(var(--hsl-bullish));
		}

		&:is(.bearish, .error) {
			background: hsla(var(--hsl-bearish), 0.25);
			color: hsla(var(--hsl-bearish));
		}

		&:is(.warning) {
			background: hsla(var(--hsl-warning), 0.25);
			color: hsla(var(--hsl-warning));
		}
	}
</style>
