<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import * as dialog from '@zag-js/dialog';
	import { portal, normalizeProps, useMachine } from '@zag-js/svelte';
	import IconCancel from '~icons/local/cancel';

	interface Props {
		open: boolean;
		modal?: boolean;
		title: string;
		children: Snippet;
	}

	let { open = $bindable(), modal = false, title, children }: Props = $props();

	const id = $props.id();
	const service = useMachine(dialog.machine, {
		id,
		get open() {
			return open;
		},
		onOpenChange(details) {
			open = details.open;
		},
		modal
	});
	const api = $derived(dialog.connect(service, normalizeProps));
</script>

{#if api.open}
	<div use:portal {...api.getBackdropProps()}></div>
	<div use:portal {...api.getPositionerProps()}>
		<div {...api.getContentProps()} transition:slide={{ axis: 'x', duration: undefined }}>
			<div class="content-inner">
				<header>
					<h2 {...api.getTitleProps()}>{title}</h2>
					<button {...api.getCloseTriggerProps()}>
						<IconCancel />
					</button>
				</header>
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
		width: min(500px, 90vw);
		height: 100%;
		padding: 2rem;
		overflow-y: auto;
		background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-2-alpha));
		box-shadow: var(--shadow-1);
		overflow: visible;
	}

	header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		margin-bottom: 1rem;
	}

	h2 {
		margin: 0;
		font: var(--f-heading-sm-medium);
		letter-spacing: var(--ls-heading-sm, normal);
	}

	button {
		display: flex;
		justify-content: flex-end;
		background: transparent;
		border: none;
		font-size: 16px;
		padding: 0;
		cursor: pointer;

		:global(.icon *) {
			stroke-width: 3;
		}
	}
</style>
