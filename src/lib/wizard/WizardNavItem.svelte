<script lang="ts">
	import { goto } from '$app/navigation';
	import IconSuccess from '~icons/local/success';
	import IconEmpty from '~icons/local/empty';

	interface Props {
		slug: string;
		label: string;
		active: boolean;
		completed: boolean;
		disabled: boolean;
	}

	let { slug, label, active, completed, disabled }: Props = $props();
</script>

<li class="wizard-nav-item">
	<button disabled={disabled || active} class={{ active, completed, disabled }} onclick={() => goto(slug)}>
		{#if completed}
			<IconSuccess />
		{:else}
			<IconEmpty />
		{/if}
		{label}
	</button>
</li>

<style>
	.wizard-nav-item {
		display: contents;

		button {
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			border: none;
			border-radius: var(--radius-lg);
			padding: var(--space-sm) var(--space-md);
			background: transparent;
			font: var(--f-ui-md-medium);
			cursor: pointer;
			transition: all var(--time-sm) ease-out;

			&.active {
				background: var(--c-box-4);
				cursor: default;
			}

			&.disabled {
				color: var(--c-text-extra-light);
				cursor: not-allowed;
				&:hover {
					background: var(--c-box-2);
				}
			}

			&.completed {
				color: var(--c-success);
				background: color-mix(in srgb, transparent, currentColor 10%);
			}
		}
	}
</style>
