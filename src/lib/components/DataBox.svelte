<!--
@component
Uses together with SummaryBox or DataBoxes to display a set of properties / statistics.
`value` may either be passed as a prop or as slot content if additional markup is required.

#### Usage
```tsx
<SummaryBox title="Fruits">
	<DataBox label="Banana" value="Minions favorite" />
	<DataBox label="Tomato">yes, it's <em>is</em> a fruit!</DataBox>
</SummaryBox>
```
-->
<script lang="ts">
	export let label: string;
	export let size: string = 'md';
	export let value: string | undefined = undefined;
	export let valueClass: string = '';
</script>

<div class="data-box {size}">
	<span class="label">{label}</span>
	<span class="value {valueClass}"><slot>{value}</slot></span>
</div>

<style lang="postcss">
	.data-box {
		border-radius: var(--border-radius-md);
		background: var(--c-background-5);
		display: grid;
		gap: 0.875rem;
		padding: 1.5rem;

		@media (--viewport-sm-down) {
			gap: 0.5rem;
			padding: 1.25rem;
		}
	}

	.label,
	.value {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.label {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		color: var(--c-text-extra-light);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}
	}

	.value {
		@nest .xs & {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-lg-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}
		}

		@nest .sm & {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-lg-medium);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}

		@nest .md & {
			font: var(--f-ui-xxl-medium);
			letter-spacing: var(--f-ui-xxl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xl-medium);
				letter-spacing: var(--f-ui-xl-spacing, normal);
			}
		}

		@nest .lg & {
			font: var(--f-ui-xxxl-medium);
			letter-spacing: var(--f-ui-xxxl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-xxl-medium);
				letter-spacing: var(--f-ui-xxl-spacing, normal);
			}
		}

		& :global a {
			font: inherit;
			text-decoration: underline;
		}
	}
</style>
