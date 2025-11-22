<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import { portal, normalizeProps, useMachine } from '@zag-js/svelte';
	import * as dialog from '@zag-js/dialog';
	import IconCancel from '~icons/local/cancel';

	interface Props extends Omit<dialog.Props, 'id'> {
		title: string;
		allowBackgroundInteraction?: boolean;
		children: Snippet;
	}

	let { title, modal = false, allowBackgroundInteraction = false, children, ...restProps }: Props = $props();

	const id = $props.id();
	const service = useMachine(dialog.machine, () => ({ id, modal, ...restProps }));
	const api = $derived(dialog.connect(service, normalizeProps));

	let pointerEvents = $derived(allowBackgroundInteraction ? 'none' : undefined);
</script>

{#if api.open}
	<div use:portal {...api.getBackdropProps()} style:pointer-events={pointerEvents}></div>
	<div use:portal {...api.getPositionerProps()} style:pointer-events={pointerEvents}>
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
