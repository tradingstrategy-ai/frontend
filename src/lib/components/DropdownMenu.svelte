<!--
@component
A click-triggered dropdown menu for grouping navigation links.

- Built on `@zag-js/menu` for accessibility, keyboard navigation, and click-outside dismiss
- Highlights trigger when any child link matches the current page

@example

```svelte
<DropdownMenu
  label="Charts"
  items={[
    { href: '/path/one', label: 'Option one' },
    { href: '/path/two', label: 'Option two' }
  ]}
  isActive={(href) => page.url.pathname === href}
  resolveHref={resolve}
/>
```
-->
<script lang="ts">
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import * as menu from '@zag-js/menu';
	import IconChevronDown from '~icons/local/chevron-down';

	interface DropdownMenuItem {
		readonly href: string;
		readonly label: string;
	}

	interface Props {
		/** The label shown on the dropdown trigger button */
		label: string;
		/** Array of menu items with href and label */
		items: readonly DropdownMenuItem[];
		/** Function to determine if a given href is the active page */
		isActive?: (href: string) => boolean;
		/** Optional function to transform hrefs (e.g., resolve()) */
		resolveHref?: (href: string) => string;
		/** Optional CSS class for the root element */
		class?: string;
	}

	let { label, items, isActive, resolveHref, class: classes }: Props = $props();

	const id = $props.id();
	const service = useMachine(menu.machine, () => ({ id }));
	const api = $derived(menu.connect(service, normalizeProps));

	let anyActive = $derived(items.some((item) => isActive?.(item.href)));
</script>

<div class="dropdown-menu {classes ?? ''}">
	<button {...api.getTriggerProps()} class="trigger" class:active={anyActive}>
		{label}
		<IconChevronDown />
	</button>

	<div {...api.getPositionerProps()}>
		<div {...api.getContentProps()} class="panel">
			{#each items as item (item.href)}
				{@const href = resolveHref ? resolveHref(item.href) : item.href}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a {...api.getItemProps({ value: item.href })} {href} class:active={isActive?.(item.href)}>
					{item.label}
				</a>
			{/each}
		</div>
	</div>
</div>

<style>
	.dropdown-menu {
		position: relative;
		display: inline-flex;
	}

	.trigger {
		all: unset;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		gap: 0.25em;
		color: var(--c-text-extra-light);
		font: inherit;
		transition: color var(--time-sm);

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}

		:global(.icon) {
			width: 0.75em;
			height: 0.75em;
			transition: transform var(--time-sm) ease-out;
		}
	}

	.trigger[aria-expanded='true'] :global(.icon) {
		transform: rotate(180deg);
	}

	[data-part='positioner'] {
		z-index: 100;
	}

	.panel {
		display: flex;
		flex-direction: column;

		&[hidden] {
			display: none;
		}
		min-width: max-content;
		padding: var(--space-ss) 0;
		background: var(--c-text-inverted);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-1);
	}

	.panel a {
		display: block;
		padding: var(--space-ss) var(--space-md);
		color: var(--c-text-extra-light);
		text-decoration: none;
		white-space: nowrap;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);
		transition: all var(--time-sm) ease-out;

		&:is(:hover, [data-highlighted]) {
			color: var(--c-text);
			background: var(--c-box-2);
			outline: none;
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}
	}
</style>
