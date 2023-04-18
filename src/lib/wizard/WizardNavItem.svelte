<script lang="ts">
	import { Icon } from '$lib/components';

	export let href: string;
	export let state: 'inactive' | 'active' | 'completed' = 'inactive';
	export let canNavigateTo = false;
</script>

<a data-sveltekit-noscroll href={canNavigateTo ? href : undefined} style="display: contents;" on:click>
	<li class="wizard-nav-item {state}">
		<Icon name={state === 'completed' ? 'success' : 'empty'} />
		<slot />
	</li>
</a>

<style lang="postcss">
	.wizard-nav-item {
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font: var(--f-ui-md-medium);
		list-style: none;
		padding: var(--space-sm) var(--space-md);
		transition: all var(--time-sm) ease-out;
	}

	.inactive {
		color: hsla(var(--hsl-text-extra-light)) !important;
		&:hover {
			background: hsla(var(--hsl-box), var(--a-box-b));
		}
	}

	.active {
		background: hsla(var(--hsl-box), var(--a-box-d));
	}

	.completed {
		background: hsla(var(--hsl-success), 0.1);
		color: hsla(var(--hsl-success));
	}
</style>
