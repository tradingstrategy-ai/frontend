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
		--value-font: var(--f-heading-lg-medium);
		&.lg {
			--value-font: var(--f-heading-xl-medium);
		}
		&.xl {
			--value-font: var(--f-heading-xxl-medium);
		}

		@media (--viewport-sm-down) {
			--label-font: var(--f-ui-sm-medium);
			--value-font: var(--f-heading-md-medium);
			&.lg {
				--value-font: var(--f-heading-lg-medium);
			}
			&.xl {
				--value-font: var(--f-heading-xl-medium);
			}
		}

		.label {
			margin-bottom: 0.5rem;
			font: var(--label-font);
			color: var(--c-text-extra-light);
		}

		.value {
			font: var(--value-font);
		}
	}
</style>
