<!--
@component
Display a numeric input field with currency unit indicator. Passes unknown
props through to HTML input element.

**NOTE:** unlike `<input type="number" ...>` elements in Svelte, this component
does _not_ coerce the `value` prop to a `number`. The raw `string` value is
retained to avoid rounding errors and allow for conversion to `BigInt`.

@example

```svelte
<MoneyInput bind:value size="lg" tokenUnit="USDC" />
```
-->
<script lang="ts">
	import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
	import { EntitySymbol } from '$lib/components';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let step: number | 'any' = 'any';
	export let token: GetTokenBalanceReturnType;
	export let value = '';

	let inputEl: HTMLInputElement;

	// ensure value matches inputEl.value on mount (also see on:input below)
	$: inputEl && setValue();

	function setValue() {
		value = inputEl.value;
	}

	export function focus(options = {}) {
		inputEl.focus(options);
	}
</script>

<span class="money-input size-{size}" class:disabled>
	<div class="inner">
		<!-- NOTE: don't use bind:value b/c it coerces numeric inputs to number -->
		<input
			bind:this={inputEl}
			{value}
			type="number"
			placeholder="0.00"
			{step}
			{disabled}
			{...$$restProps}
			on:input={setValue}
			on:input
			on:focus
			on:blur
			on:keydown
			on:change
		/>
		{#if token}
			<span class="unit">
				<EntitySymbol label={token.label} logoUrl={getLogoUrl('token', token.symbol)} />
			</span>
		{/if}
	</div>
	{#if $$slots.default}
		<div class="estimated-value">
			<slot />
		</div>
	{/if}
</span>

<style>
	.money-input {
		width: var(--text-input-width, auto);
		max-width: var(--text-input-max-width, auto);

		.inner {
			display: flex;
			height: 4.25rem;
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			overflow: hidden;
		}

		&.disabled {
			opacity: 0.65;
		}

		input {
			flex: 1;
			width: 100%;
			height: var(--text-input-height, var(--height));
			padding-inline: 0.75rem;
			border: none;
			background: var(--c-input-background);
			color: inherit;
			font: var(--f-ui-xxl-medium);
			letter-spacing: var(--text-input-letter-spacing, var(--letter-spacing, normal));
			text-align: right;
			transition: background var(--time-sm) ease-out;

			&::placeholder {
				color: var(--c-text-extra-light);
			}

			&:disabled {
				background: var(--c-box-1);
			}

			&:focus,
			&:hover {
				background: var(--c-input-background-focus);
			}

			&:focus {
				border-color: var(--c-input-border-focus);
				outline: none;
			}
		}

		.unit {
			display: flex;
			max-width: 10rem;
			height: 100%;
			padding-inline: 0.75rem;
			background: var(--c-box-2);
			font: var(--f-ui-lg-bold);
			text-align: center;
		}

		.estimated-value {
			display: flex;
			gap: 1rem;
			justify-content: flex-end;
			margin-top: 1rem;
			text-align: right;
		}
	}
</style>
