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
	import { createEventDispatcher } from 'svelte';
	import IconCancel from '~icons/local/cancel';
	import { disableScroll } from '$lib/actions/scroll';

	export let title = '';
	export let open = false;
	export let fullScreen = false;

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
			// keep state synced when dialog is closed via the `escape` key
			escaped: () => (open = false)
		},

		closed: {
			_enter: () => dialog.close(),
			_exit: () => dispatch('open')
		}
	});

	// call `toggle` whenever `open` is changed
	$: dialog && state.toggle(open);
</script>

<svelte:body use:disableScroll={open} />

<dialog bind:this={dialog} class={fullScreen ? 'full-screen' : 'compact'} on:close={state.escaped} data-css-props>
	<slot name="header">
		<header>
			<h5><slot name="title">{title}</slot></h5>
			<button aria-label="Close dialog" on:click={() => (open = false)}>
				<IconCancel />
			</button>
		</header>
	</slot>
	<slot />
	<slot name="footer" />
</dialog>

<style lang="postcss">
	[data-css-props] {
		&:where(.compact) {
			--dialog-width: min(calc(100% - (var(--container-margin) * 2)), var(--container-max-width));
			--dialog-min-width: 18rem;
			--dialog-max-width: 32rem;
			--dialog-padding: 2rem;
		}

		&:where(.full-screen) {
			--dialog-width: auto;
			--dialog-min-width: auto;
			--dialog-max-width: 100vm;
			--dialog-padding: 1.5rem;

			@media (--viewport-xs) {
				--dialog-padding: 1.25rem;
			}
		}
	}

	dialog {
		border: none;
		outline: none;
		color: var(--c-text);
		width: var(--dialog-width);
		max-width: var(--dialog-max-width);
		min-width: var(--dialog-min-width);
		padding: 0;
		background: var(--c-body);

		&::backdrop {
			background: var(--c-backdrop);
			opacity: 0.25;
		}

		> :global(*) {
			padding: var(--dialog-padding);
		}
	}

	.compact {
		border-radius: var(--radius-xs);

		:global(header) {
			padding-bottom: 0;
		}

		:global(footer) {
			padding-top: 0;
		}
	}

	.full-screen {
		height: var(--viewport-height);
		max-height: unset;

		&[open] {
			display: grid;
			grid-template-rows: auto 1fr auto;
		}

		:global(:is(header, footer)) {
			z-index: 1;
			box-shadow: var(--shadow-1);
			background: var(--c-box-2);
		}
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.5rem;
		align-items: center;

		h5 {
			margin: 0;

			.compact & {
				font: var(--f-ui-lg-medium);
				letter-spacing: var(--f-ui-lg-spacing, normal);
				color: var(--c-text-extra-light);
			}

			.full-screen & {
				font: var(--f-heading-sm-medium);
				letter-spacing: var(--f-heading-sm-spacing, normal);
				color: var(--c-text-light);

				@media (--viewport-xs) {
					font: var(--f-heading-xs-medium);
					letter-spacing: var(--f-heading-xs-spacing, normal);
				}
			}
		}

		button {
			display: flex;
			border: none;
			outline: none;
			padding: 0;
			background: transparent;
			color: var(--c-text-extra-light);
			cursor: pointer;

			:global(.icon path) {
				transition: var(--transition-1);
				stroke-width: 2.5;
			}

			&:is(:hover, :focus) :global(.icon path) {
				stroke-width: 3;
				color: var(--c-text);
			}
		}
	}
</style>
