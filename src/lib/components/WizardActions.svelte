<footer class="wizard-actions">
	{#if $$slots.cancel}
		<div class="cancel">
			<slot name="cancel" />
		</div>
	{/if}
	<div class="progress-actions">
		<slot />
	</div>
</footer>

<style lang="postcss">
	.wizard-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		@media (--viewport-sm-down) {
			justify-content: space-between;
		}

		& .cancel {
			margin-right: var(--space-ms);
		}

		& .progress-actions {
			display: flex;
			gap: var(--space-md);
			justify-content: flex-end;
		}

		@media (--viewport-sm-down) {
			margin-block: var(--space-7xl);
		}

		@media (--viewport-sm-up) {
			display: grid;
			grid-auto-flow: column;
			margin-top: var(--space-3xl);
			place-content: end;
		}
	}
</style>
