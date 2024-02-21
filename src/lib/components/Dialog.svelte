<!--
@component
Modal dialog component. Dispatches `open` and `close` events when state changes
(but not on initial render/mount).

#### Usage:
```tsx
  <Dialog
		title="Cool dialog"
		bind:open
		on:open={handleOpen}
		on:close={handleClose}
	/>
```
-->
<script lang="ts">
	import fsm from 'svelte-fsm';
	import { createEventDispatcher, onMount } from 'svelte';
	import { Icon } from '$lib/components';

	export let title: string;
	export let open = false;

	const dispatch = createEventDispatcher();
	let dialog: HTMLDialogElement;

	// finite state machine to manage dialog open/closed states and transitions
	// see: https://github.com/kenkunz/svelte-fsm/wiki
	const state = fsm('initial', {
		'*': {
			toggle: (toOpen) => (toOpen ? 'open' : 'closed')
		},

		open: {
			_enter: () => dialog.showModal(),
			_exit: () => dispatch('close'),
			escaped: () => (open = false)
		},

		closed: {
			_enter: () => dialog.close(),
			_exit: () => dispatch('open')
		}
	});

	$: dialog && state.toggle(open);

	onMount(() => {
		// this is needed to keep state synced when dialog is closed via the `escape` key
		dialog.addEventListener('close', state.escaped);
		return () => dialog.removeEventListener('close', state.escaped);
	});
</script>

<dialog bind:this={dialog} data-css-props>
	<heading>
		<h5>{title}</h5>
		<button on:click={() => (open = false)}>
			<Icon name="cancel" size="16px" />
		</button>
	</heading>
	<slot />
</dialog>

<style lang="postcss">
	[data-css-props] {
		--dialog-width: min(calc(100% - (var(--container-margin) * 2)), var(--container-max-width));
		--dialog-min-width: 300px;
		--dialog-max-width: 500px;
	}

	dialog {
		max-width: min(var(--dialog-width), var(--dialog-max-width));
		min-width: var(--dialog-min-width);
		padding: var(--space-xl);
		border: none;
		border-radius: var(--radius-xs);
		background: var(--c-body);
	}

	dialog::backdrop {
		background: var(--c-backdrop);
		opacity: 0.25;
	}

	heading {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-ss);
		align-items: center;
		margin-bottom: var(--space-ss);
		color: var(--c-text-extra-light);

		h5 {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-lg-spacing, normal);
			margin: 0;
		}

		button {
			display: flex;
			gap: var(--space-ss);
			justify-content: center;
			border: none;
			padding: 0;
			background: transparent;
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-lg-spacing, normal);
			text-transform: capitalize;
			cursor: pointer;
		}
	}
</style>
