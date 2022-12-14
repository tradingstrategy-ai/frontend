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

<dialog bind:this={dialog}>
	<heading>
		<h5>{title}</h5>
		<button on:click={() => (open = false)}>
			<Icon name="cancel" size="16px" />
		</button>
	</heading>
	<slot />
</dialog>

<style lang="postcss">
	dialog {
		border: none;
		border-radius: 0.75rem;
		background: var(--c-body-v1);
		padding: 2rem;
		width: 300px;
	}

	dialog::backdrop {
		--cm-light-backdrop-color: black;
		--cm-dark-backdrop-color: white;

		background: var(--cm-light-backdrop-color);
		opacity: 0.25;
	}

	@media (prefers-color-scheme: dark) {
		:global(body:not([data-color-mode='light'])) dialog::backdrop {
			background: var(--cm-dark-backdrop-color);
		}
	}

	:global(body[data-color-mode='dark']) dialog::backdrop {
		background: var(--cm-dark-backdrop-color);
	}

	heading {
		display: grid;
		grid-template-columns: auto min-content;
		align-items: center;
		color: var(--c-text-4-v1);

		& h5 {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}

		& button {
			display: flex;
			gap: 0.5rem;
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
