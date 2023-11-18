<script lang="ts">
	import { goto } from '$app/navigation';
	import { Icon } from '$lib/components';

	export let slug: string;
	export let label: string;
	export let active = false;
	export let completed = false;
	export let disabled = false;
</script>

<li class="wizard-nav-item">
	<button disabled={disabled || active} class:active class:completed class:disabled on:click={() => goto(slug)}>
		<Icon name={completed ? 'success' : 'empty'} />
		{label}
	</button>
</li>

<style lang="postcss">
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
				background: hsl(var(--hsla-box-4));
				cursor: default;
			}

			&.disabled {
				color: hsla(var(--hsl-text-extra-light));
				cursor: not-allowed;
				&:hover {
					background: hsl(var(--hsla-box-2));
				}
			}

			&.completed {
				background: hsla(var(--hsl-success), 0.1);
				color: hsla(var(--hsl-success));
			}
		}
	}
</style>
