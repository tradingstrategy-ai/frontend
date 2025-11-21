<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import * as dialog from '@zag-js/dialog';
	import { portal, normalizeProps, useMachine } from '@zag-js/svelte';
	import IconCancel from '~icons/local/cancel';

	interface Props {
		title: string;
		open?: boolean;
		modal?: boolean;
		onClose?: () => void;
		children: Snippet;
	}

	let { title, open = false, modal = false, onClose, children }: Props = $props();

	const id = $props.id();
	const service = useMachine(dialog.machine, {
		id,
		modal,

		get open() {
			return open;
		},

		onOpenChange(details) {
			if (!details.open) onClose?.();
		}
	});
	const api = $derived(dialog.connect(service, normalizeProps));
</script>

{#if api.open}
	<div use:portal {...api.getBackdropProps()}></div>
	<div use:portal {...api.getPositionerProps()}>
		<div {...api.getContentProps()} transition:slide={{ axis: 'x', duration: undefined }}>
			<div class="content-inner">
				<nav>
					<h2 {...api.getTitleProps()}>{title}</h2>
					<button {...api.getCloseTriggerProps()}>
						<IconCancel />
					</button>
				</nav>
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	[data-part='positioner'] {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
	}

	.content-inner {
		width: min(70vw, 50rem);
		height: 100%;
		padding: 2rem;
		overflow-y: auto;
		background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-2-alpha));
		box-shadow: var(--shadow-1);
		overflow: visible;
	}

	nav {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		margin-bottom: 2rem;
		color: var(--c-text-extra-light);
	}

	h2 {
		margin: 0;
		font: var(--f-heading-xs-medium);
		letter-spacing: var(--ls-heading-xs, normal);
	}

	button {
		display: flex;
		justify-content: flex-end;
		background: transparent;
		border: none;
		font-size: 16px;
		padding: 0;
		cursor: pointer;

		&:hover {
			color: var(--c-text);
		}

		:global(.icon *) {
			stroke-width: 2.5;
		}
	}
</style>
