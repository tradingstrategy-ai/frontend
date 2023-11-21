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
		--fs-heading: 1rem;
		--f-dt: var(--f-ui-sm-medium);
		--ls-dt: var(--ls-ui-sm);
		--f-dd: var(--f-ui-xxl-medium);
		--ls-dd: var(--ls-ui-xxl);

		@media (--viewport-sm-down) {
			--fs-heading: 0.875rem;
			--f-dd: var(--f-ui-xl-medium);
			--ls-dd: var(--ls-ui-xl);
		}

		@media (--viewport-xs) {
			--f-dt: var(--f-ui-xs-medium);
			--ls-dt: var(--ls-ui-xs);
			--f-dd: var(--f-ui-lg-medium);
			--ls-dd: var(--ls-ui-lg);
		}

		display: grid;
		gap: 1rem;
		background: hsl(var(--hsla-box-1));
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: var(--fs-heading);
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
			font: var(--f-dt);
			letter-spacing: var(--ls-dt, normal);
			color: hsl(var(--hsl-text-light));
		}

		:global(dd) {
			font: var(--f-dd);
			letter-spacing: var(--ls-dd, normal);
		}
	}
</style>
