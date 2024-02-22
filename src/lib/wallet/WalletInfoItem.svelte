<script lang="ts">
	export let label: string = '';
	export let value: string = '';
</script>

<li class="wallet-info-item">
	<span class="label">
		<slot name="label">{label}</slot>
	</span>
	<span class="value">
		<slot>{value}</slot>
	</span>
</li>

<style lang="postcss">
	.wallet-info-item {
		display: grid;
		gap: var(--space-md);
		align-items: center;
		background: var(--c-box-2);
		border-radius: var(--radius-md);
		padding: var(--space-md) var(--space-ml);

		--label-font: var(--f-ui-md-medium);
		--label-spacing: var(--f-ui-md-spacing);
		--value-font: var(--f-ui-xl-medium);
		--value-spacing: var(--f-ui-xl-spacing);

		@container (width >= 420px) {
			grid-template-columns: var(--wallet-info-label-width, auto) 1fr;
			min-height: 3.75rem;
			padding-block: var(--space-sm);
			--value-font: var(--f-ui-lg-medium);
			--value-spacing: var(--f-ui-lg-spacing);
		}

		> span {
			@container (width >= 420px) {
				padding: 0;
			}
		}

		.label {
			margin-top: var(--space-xxs);
			font: var(--label-font);
			letter-spacing: var(--label-spacing);

			@container (width >= 420px) {
				margin-top: 0;
			}
		}

		.value {
			font: var(--value-font);
			letter-spacing: var(--value-spacing);

			@container (width >= 420px) {
				text-align: var(--wallet-info-value-align, auto);
			}
		}
	}
</style>
