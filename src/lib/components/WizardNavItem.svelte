<script lang="ts">
	import { Icon } from '$lib/components';

	export let slug: string;
	export let label: string;
	export let active = false;
	export let completed = false;
	export let disabled = false;

	let tag: 'a' | 'span';
	$: tag = active || disabled ? 'span' : 'a';
	$: href = tag === 'a' ? slug : undefined;
</script>

<li class="wizard-nav-item">
	<svelte:element this={tag} class="inner" class:active class:completed class:disabled {href}>
		<Icon name={completed ? 'success' : 'empty'} />
		{label}
	</svelte:element>
</li>

<style lang="postcss">
	.wizard-nav-item {
		display: contents;

		& .inner {
			border-radius: var(--radius-lg);
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			font: var(--f-ui-md-medium);
			padding: var(--space-sm) var(--space-md);
			transition: all var(--time-sm) ease-out;

			&.active {
				background: hsla(var(--hsl-box), var(--a-box-d));
			}

			&.disabled {
				color: hsla(var(--hsl-text-extra-light));
				cursor: not-allowed;
				&:hover {
					background: hsla(var(--hsl-box), var(--a-box-b));
				}
			}

			&.completed {
				background: hsla(var(--hsl-success), 0.1);
				color: hsla(var(--hsl-success));
			}
		}
	}
</style>
