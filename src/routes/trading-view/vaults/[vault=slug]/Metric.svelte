<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string | Snippet;
		value?: string;
		size?: 'md' | 'lg' | 'xl';
		children?: Snippet;
	}

	let { label, value, size = 'md', children }: Props = $props();
</script>

<div class={['metric', size]}>
	<div class="label">
		{#if label instanceof Function}
			{@render label()}
		{:else}
			{label}
		{/if}
	</div>
	<div class="value">
		{#if children}
			{@render children()}
		{:else if value}
			{value}
		{:else}
			---
		{/if}
	</div>
</div>

<style>
	.metric {
		display: grid;
		align-content: start;

		--label-font: var(--f-ui-md-medium);
		--value-font: 500 30px/40px var(--ff-ui);
		&.lg {
			--value-font: 500 38px/44px var(--ff-ui);
		}
		&.xl {
			--value-font: 500 44px/56px var(--ff-ui);
		}

		@media (--viewport-sm-down) {
			--label-font: var(--f-ui-sm-medium);
			--value-font: 500 26px/36px var(--ff-ui);
			&.lg {
				--value-font: 500 30px/40px var(--ff-ui);
			}
			&.xl {
				--value-font: 500 38px/44px var(--ff-ui);
			}
		}

		.label {
			margin-bottom: 0.5rem;
			font: var(--label-font);
			font-weight: bold;
			color: var(--c-text-light);
		}

		.value {
			font: var(--value-font);
			color: var(--c-text-extra-light);
		}
	}
</style>
