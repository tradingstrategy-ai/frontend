<!--
@component
Display a numeric input field with currency unit indicator. Passes unknown
props through to HTML input element.

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
	export let value: number | null = null;
	export let showConversionLabel = false;
	export let conversionRatio = 1;
	export let conversionTokenUnit = 'USDC';

	let inputEl: HTMLInputElement;

	export function focus(options = {}) {
		inputEl.focus(options);
	}
</script>

<span class="money-input size-{size}" class:disabled>
	<div class="inner">
		<input
			bind:this={inputEl}
			bind:value
			type="number"
			placeholder="0.00"
			{step}
			{disabled}
			{...$$restProps}
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

	{#if showConversionLabel && value}
		<span class="conversion-label">
			This redemption is worth of
			<EntitySymbol label={conversionTokenUnit} slug={conversionTokenUnit.toLowerCase()} type="token">
				{value * conversionRatio}
				{conversionTokenUnit}
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
