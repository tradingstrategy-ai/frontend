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
	import { EntitySymbol } from '$lib/components';

	export let disabled = false;
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let step: number | 'any' = 'any';
	export let tokenUnit: string;
	export let value = '';
	export let conversionLabel: string | undefined = undefined;
	export let conversionRatio: number | undefined = undefined;
	export let conversionUnit: string | undefined = undefined;

	let inputEl: HTMLInputElement;

	// ensure value matches inputEl.value on mount (also see on:input below)
	$: inputEl && setValue();

	function setValue() {
		value = inputEl.value;
	}

	function getConvertedValue(value: MaybeNumber, ratio: number) {
		const converted = (Number(value) || 0) * ratio;
		return converted.toLocaleString('en', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
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
			{#if tokenUnit}
				<span class="unit">
					<EntitySymbol type="token" label={tokenUnit} slug={tokenUnit.toLowerCase()} />
				</span>
			{/if}
		</div>
	</div>

	{#if conversionUnit && conversionRatio}
		<span class="conversion-label">
			{conversionLabel}
			<EntitySymbol label={conversionUnit} slug={conversionUnit.toLowerCase()} type="token">
				{getConvertedValue(value, conversionRatio)}
				{conversionUnit}
			</EntitySymbol>
		</span>
	{/if}
</span>

<style lang="postcss">
	.money-input {
		position: relative;
		display: inline-grid;
		gap: var(--space-md);
		position: relative;
		max-width: var(--text-input-max-width, auto);
		width: var(--text-input-width, auto);

		& .inner {
			display: flex;
			background: hsla(var(--input-background));
			border: 1px hsla(var(--hsl-box), var(--a-box-c)) solid;
			border-radius: var(--radius-sm);
			height: 4.25rem;
			overflow: hidden;
		}

		& .unit {
			background-image: linear-gradient(hsla(var(--hsl-box), var(--a-box-b)), hsla(var(--hsl-box), var(--a-box-b))),
				linear-gradient(hsla(var(--hsl-body)), hsla(var(--hsl-body)));
			display: grid;
			font: var(--f-ui-lg-bold);
			height: 100%;
			place-items: center;
			padding: 0 var(--space-md);
			text-align: center;
		}

		&.disabled {
			opacity: 0.65;
		}

		& .conversion-label {
			display: flex;
			justify-content: flex-end;
			text-align: right;
			gap: var(--space-md);
		}

		& input {
			background: transparent;
			border: none;
			color: var(--c-text-1-v1);
			font: var(--f-ui-xxl-medium);
			height: var(--text-input-height, var(--height));
			letter-spacing: var(--text-input-letter-spacing, var(--letter-spacing, normal));
			padding: 0 var(--space-sl);
			text-align: right;
			transition: background var(--time-sm) ease-out;
			width: 100%;

			&::placeholder {
				color: hsl(var(--hsl-text-extra-light));
			}

			&:disabled {
				background: hsla(var(--hsl-box), var(--a-box-a));
			}

			&:focus,
			&:hover {
				background: hsla(var(--input-background-active));
			}

			&:focus {
				border-color: hsla(var(--hsl-text-extra-light));
				outline: none;
			}
		}
	}
</style>
