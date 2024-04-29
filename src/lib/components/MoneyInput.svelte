<!--
@component
Display a numeric input field with currency unit indicator. Passes unknown
props through to HTML input element.

**NOTE:** unlike `<input type="number" ...>` elements in Svelte, this component
does _not_ coerce the `value` prop to a `number`. The raw `string` value is
retained to avoid rounding errors and allow for conversion to `BigInt`.

#### Usage:
```tsx
<MoneyInput bind:value size="lg" tokenUnit="USDC" />
```
-->
<script lang="ts">
	import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
	import { EntitySymbol } from '$lib/components';

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
		<div class="symbols">
			{#if token}
				<span class="unit">
					<EntitySymbol type="token" label={token.label} slug={token.symbol.toLowerCase()} />
				</span>
			{/if}
		</div>
	</div>
	{#if $$slots.default}
		<div class="estimated-value">
			<slot />
		</div>
	{/if}
</span>

<style lang="postcss">
	.money-input {
		width: var(--text-input-width, auto);
		max-width: var(--text-input-max-width, auto);

		.inner {
			display: flex;
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			height: 4.25rem;
			overflow: hidden;
		}

		.unit {
			display: grid;
			place-items: center;
			height: 100%;
			padding-inline: 1rem;
			background: var(--c-box-2);
			font: var(--f-ui-lg-bold);
			text-align: center;
		}

		&.disabled {
			opacity: 0.65;
		}

		input {
			height: var(--text-input-height, var(--height));
			width: 100%;
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

		.estimated-value {
			display: flex;
			gap: 1rem;
			justify-content: flex-end;
			margin-top: 1rem;
			text-align: right;
		}
	}
</style>
