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
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let value: string | undefined = undefined;
	export let valueClass: string = '';

    // How do we behave if the same data box list have
    // rows from multiple different height boxes
    export let tightness: "equal-rows" | "tight" = "equal-rows";
</script>

<div class="data-box {size} {tightness}">
	<span class="label">{label}</span>
	<span class="value {valueClass}"><slot>{value || '---'}</slot></span>
</div>

<style lang="postcss">
	.data-box {
		border-radius: var(--radius-md);
		background: hsla(var(--hsl-box), var(--a-box-b));
		display: grid;

        &.tight {
            display: flex;
            flex-direction: column;
        }

		&.xs {
			gap: var(--space-ss);
			padding: var(--space-ml) var(--space-ls);

			@media (--viewport-sm-down) {
				gap: var(--space-xxs);
				padding: var(--space-ms) var(--space-md);
			}
		}

		&.sm {
			gap: var(--space-sl);
			padding: var(--space-ls);

			@media (--viewport-sm-down) {
				gap: var(--space-xs);
				padding: var(--space-md);
			}
		}

		&.md {
			gap: var(--space-ms);
			padding: var(--space-lg);

			@media (--viewport-sm-down) {
				gap: var(--space-ss);
				padding: var(--space-ls);
			}
		}

		&.lg {
			gap: var(--space-md);
			padding: var(--space-ll);

			@media (--viewport-sm-down) {
				gap: var(--space-sm);
				padding: var(--space-ls);
			}
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
		color: hsla(var(--hsl-text-extra-light));

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
