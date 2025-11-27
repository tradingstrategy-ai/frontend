<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		value?: string;
		size?: 'md' | 'lg' | 'xl';
		children?: Snippet;
	}

	let { label, value, size = 'md', children }: Props = $props();
</script>

<div class={['metric', size]}>
	<div class="label">{label}</div>
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

		.label {
			margin-bottom: 0.5rem;
			font: var(--f-ui-md-medium);
			color: var(--c-text-extra-light);
		}

		.value {
			font: var(--f-heading-lg-medium);

			.lg & {
				font: var(--f-heading-xl-medium);
			}

			.xl & {
				font: var(--f-heading-xxl-medium);
			}
		}

		@media (--viewport-sm-down) {
			.label {
				font: var(--f-ui-sm-medium);
			}

			.value {
				font: var(--f-heading-md-medium);

				.lg & {
					font: var(--f-heading-lg-medium);
				}

				.xl & {
					font: var(--f-heading-xl-medium);
				}
			}
		}
	}
</style>
