<!--
@component
A tooltip component used with key metrics

The component includes an `underline` utility CSS class that
can be used in the `trigger` slot element if desired.

For more information see:
- https://codepen.io/GemmaCroad/pen/LYpbdom
- https://stackoverflow.com/a/40628352/315168
- https://svelte.dev/tutorial/named-slots

@example

```svelte
<Tooltip>
	<span slot="trigger" class="underline">
		a piece of text with underline
	</span>
	<svelte:fragment slot="popup">
		Hello there
	</svelte:fragment>
</Tooltip>
```
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';

	const VIEWPORT_MARGIN = 8;

	let tooltip: HTMLElement;
	let popup: HTMLButtonElement;
	let isOpen = $state(false);
	let isPositioned = $state(false);
	let popupPosition = $state('');

	async function showPopup(): Promise<void> {
		isOpen = true;
		isPositioned = false;
		await tick();
		positionPopup();
	}

	function hidePopup(): void {
		isOpen = false;
		isPositioned = false;
	}

	function repositionPopup(): void {
		if (isOpen) positionPopup();
	}

	function positionPopup(): void {
		if (tooltip == null || popup == null) return;

		const triggerRect = tooltip.getBoundingClientRect();
		const popupRect = popup.getBoundingClientRect();
		const popupWidth = Math.min(popupRect.width, window.innerWidth - VIEWPORT_MARGIN * 2);
		const popupHeight = Math.min(popupRect.height, window.innerHeight - VIEWPORT_MARGIN * 2);
		const preferredLeft = triggerRect.left + (triggerRect.width - popupWidth) / 2;
		const maxLeft = window.innerWidth - popupWidth - VIEWPORT_MARGIN;
		const left = Math.max(VIEWPORT_MARGIN, Math.min(preferredLeft, maxLeft));
		const belowTop = triggerRect.bottom;
		const aboveTop = triggerRect.top - popupHeight;
		const top =
			belowTop + popupHeight <= window.innerHeight - VIEWPORT_MARGIN ? belowTop : Math.max(VIEWPORT_MARGIN, aboveTop);

		popupPosition = `left: ${left}px; top: ${top}px; right: auto; bottom: auto; transform: none;`;
		isPositioned = true;
	}

	onMount(() => {
		window.addEventListener('resize', repositionPopup);
		window.addEventListener('scroll', repositionPopup, true);

		return () => {
			window.removeEventListener('resize', repositionPopup);
			window.removeEventListener('scroll', repositionPopup, true);
		};
	});
</script>

<dfn
	bind:this={tooltip}
	class="tooltip ds-3"
	onmouseenter={showPopup}
	onmouseleave={hidePopup}
	onfocusin={showPopup}
	onfocusout={hidePopup}
>
	<span class="trigger targetable-above">
		<slot name="trigger" />
	</span>
	<!-- popup MUST be a button element (disabled); see Tooltip.test.ts -->
	<button
		bind:this={popup}
		class="popup"
		data-open={isOpen}
		data-positioned={isPositioned}
		style={popupPosition}
		disabled
	>
		<div class="inner">
			<slot name="popup" />
		</div>
	</button>
</dfn>

<style>
	.tooltip {
		font-style: normal;

		.trigger {
			font-style: normal;
			cursor: pointer;

			/* Utility class to provide affordance that the trigger is interactive */
			:global(.underline) {
				border-bottom: 1px dotted var(--c-text-light);
			}
		}

		.popup {
			display: none;
			position: fixed;
			contain: content;
			width: max-content;
			max-width: min(calc(100vw - 1rem), 300px);
			max-height: calc(100vh - 1rem);
			overflow: auto;
			padding: 0.25rem 0 0 0;
			border: none;
			background: transparent;
			white-space: normal;
			/* Need z-index or otherwise the warning text below might be rendered on the top of this text */
			z-index: 10000;

			@media (--viewport-sm-down) {
				width: calc(100vw - 1rem) !important;
				max-width: none !important;
				padding: 0;
			}

			.inner {
				padding: 1rem;
				border: 1px solid var(--c-box-3);
				border-radius: var(--radius-ms);
				background: var(--c-text-inverted);
				box-shadow: var(--shadow-3);
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--ls-ui-sm);
				color: var(--c-text);
				text-align: left;
			}

			:global(a) {
				text-decoration: underline;
				font-weight: 500;
			}

			:global(p) {
				margin-bottom: 0.5em;
			}
		}

		.popup[data-open='true'] {
			display: block;
			visibility: hidden;
		}

		.popup[data-open='true'][data-positioned='true'] {
			visibility: visible;
		}
	}
</style>
