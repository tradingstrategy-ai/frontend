<!--
@component
Display filter options as checkboxes search queries.

#### Usage:
```tsx
  <Filter
    bind:selected
    fieldName="search_field_1"
    options={[option1, option2]}
  />
```
-->
<script context="module" lang="ts">
	export interface FilterOption {
		value: string;
		label?: string;
		count?: number;
	}
</script>

<script lang="ts">
	export let fieldName: string;
	export let options: FilterOption[];
	export let selected: string[] = [];
</script>

<div class="filter">
	<h4>{fieldName.replace(/_/g, ' ')}</h4>
	<ul>
		{#each options as { label, value, count } (value)}
			{#if value}
				<li class="filter-option">
					<label>
						<input type="checkbox" {value} bind:group={selected} />
						<svg><path d="M1.61157 6.65438L6.19836 11.2412L14.3883 1.86491" /></svg>
						{label || value}
					</label>
					{#if count}
						<div class="count">{count.toLocaleString('en')}</div>
					{/if}
				</li>
			{/if}
		{/each}
	</ul>
</div>

<style lang="postcss">
	.filter {
		display: grid;
		gap: var(--space-ls);
	}

	h4 {
		text-transform: capitalize;
	}

	ul {
		display: grid;
		gap: var(--space-ml);
		padding: 0;
		list-style-type: none;
	}

	.filter-option {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--space-lg);
		margin-left: -var(--space-ss);
	}

	label {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-sl);
		align-items: center;
		margin: 0;
		border: none;
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		text-transform: capitalize;
		cursor: pointer;
		position: relative;

		&:is(:hover, :focus-within)::before {
			--offset: calc(-1 * var(--space-sm));
			background: hsla(var(--hsl-box), var(--a-box-c));
			border-radius: var(--radius-sm);
			bottom: var(--offset);
			content: '';
			position: absolute;
			left: var(--offset);
			right: var(--offset);
			top: var(--offset);
		}

		&:is(:focus-within)::before {
			outline: 2px solid var(--cm-light, var(--c-parchment-super-dark)) var(--cm-dark, var(--c-gray));
		}

		/* &:focus-within {
			background: hsla(var(--hsl-box), var(--a-box-b));
		} */
	}

	input {
		appearance: none;
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid var(--c-border-2-v1);
		border-radius: var(--radius-xxs);
		background: hsla(var(--hsl-body));
		outline: none;
	}

	svg {
		position: absolute;
		left: 0.25rem;
		width: 16px;
		height: 14px;
		fill: none;
		stroke: transparent;
		stroke-width: 3;

		@nest input:checked + & {
			stroke: currentColor;
		}
	}

	.count {
		padding: var(--space-xxs);
		border-radius: var(--radius-xxs);
		background-color: hsla(var(--hsl-box), var(--a-box-b));
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}
</style>
