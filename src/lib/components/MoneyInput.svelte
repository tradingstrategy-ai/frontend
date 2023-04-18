<!--
@component
Display a text input component (email, text or search types currently supported). Passes
unknown props through to HTML input element.

#### Usage:
```tsx
<TextInput bind:value type="email" size="lg" placeholder="email" required {disabled} />
```
-->
<script lang="ts">
	import { AlertItem, AlertList, EntitySymbol } from '$lib/components';

	export let currentBalance = 0;
	export let type: 'email' | 'text' | 'search' = 'text';
	export let disabled = false;
	export let label = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let fiatUnit: string;
	export let tokenUnit: string;
	export let value: number | null = null;
	export let showBalance = false;
	export let showMaxButton = false;

	const icon = type === 'search' ? 'search' : undefined;
	const cancelButton = type === 'search';

	let inputEl: HTMLInputElement;

	$: tag = $$slots.label || label ? 'label' : 'span';

	export function focus(options = {}) {
		inputEl.focus(options);
	}

	function applyMaxValue() {
		value = currentBalance.toFixed();
	}
</script>

<svelte:element this={tag} class="money-input size-{size}" class:has-icon={icon} class:disabled>
	<div class="inner">
		<input
			bind:this={inputEl}
			bind:value
			type="number"
			placeholder="0.00"
			{disabled}
			{...$$restProps}
			on:input
			on:focus
			on:blur
			on:keydown
		/>
		<div class="symbols">
			{#if tokenUnit}
				<span class="unit">
					<EntitySymbol name={tokenUnit} type="token" />
				</span>
			{/if}
		</div>
	</div>

	{#if showBalance && currentBalance > 0}
		<span class="current-balance">
			Balance: {currentBalance.toFixed(5)}
		</span>
	{/if}

	{#if showMaxButton}
		<button class="tile c" on:click={applyMaxValue}>Max</button>
	{/if}
</svelte:element>

{#if value && value > currentBalance}
	<AlertList size="sm" status="error">
		<AlertItem>There is not enough tokens in your wallet to deposit this amount</AlertItem>
	</AlertList>
{/if}

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

		& .fiat-value {
			font: var(--f-ui-lg-roman);
		}

		& .current-balance {
			color: hsla(var(--hsl-text-extra-light)) !important;
			font: var(--f-ui-sm-roman);
		}

		& :is(.current-balance, .fiat-value) {
			color: hsla(var(--hsl-text-light));
			font-weight: 400;
		}

		& button {
			border: none;
			cursor: pointer;
			font: var(--f-ui-sm-medium);
			margin-left: var(--space-xxxs);
			padding: var(--space-xxxs) var(--space-sl);
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

		& .label,
		& [slot='label'] {
			font-weight: 500;
		}

		&.disabled {
			opacity: 0.65;
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
