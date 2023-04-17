<footer class="wizard-actions">
	<slot />
</footer>

<style lang="postcss">
	.wizard-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;

		@media (--viewport-sm-down) {
			margin-block: var(--space-4xl);
		}

		@media (--viewport-sm-up) {
			display: grid;
			grid-auto-flow: column;
			margin-top: var(--space-3xl);
			place-content: end;
		}
	}
</style>
