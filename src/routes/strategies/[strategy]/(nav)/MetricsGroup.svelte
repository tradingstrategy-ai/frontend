<dl class="metrics-group">
	<slot />
</dl>

<style lang="postcss">
	.metrics-group {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;

		> :global(div) {
			display: grid;
			gap: 0.375rem;
		}

		:global(dt) {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm);
			color: hsl(var(--hsl-text-light));

			@media (--viewport-xs) {
				font: var(--f-ui-xs-medium);
				letter-spacing: var(--ls-ui-xs);
			}
		}

		:global(dd) {
			font: var(--f-ui-xxl-medium);
			letter-spacing: var(--ls-ui-xxl);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xl-medium);
				letter-spacing: var(--ls-ui-xl);
			}

			@media (--viewport-xs) {
				font: var(--f-ui-lg-medium);
				letter-spacing: var(--ls-ui-lg);
			}
		}
	}
</style>
