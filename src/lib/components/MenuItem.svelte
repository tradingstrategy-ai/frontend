<!--
@component
A single entry of a `Menu`. The active item keeps its `href` (so the link stays crawlable
and usable) and is marked with `aria-current="page"`, which also drives its styling.

@example

```svelte
	<MenuItem label="Top vaults" targetUrl="/vaults" active={currentPage === '/vaults'} />
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'href' | 'rel' | 'target'> {
		active?: boolean;
		label?: string;
		targetUrl: string;
		external?: boolean;
		children?: Snippet;
	}

	let { active = false, label = '', targetUrl, external = false, children, ...rest }: Props = $props();

	let rel = $derived(external ? 'external noreferrer' : undefined);
	let target = $derived(external ? '_blank' : undefined);
</script>

<li class="menu-item">
	<a href={targetUrl} {rel} {target} aria-current={active ? 'page' : undefined} {...rest}>
		{#if children}{@render children()}{:else}{label}{/if}
	</a>
</li>

<style>
	.menu-item {
		list-style-type: none;
		justify-content: inherit;
	}

	a {
		display: flex;
		justify-content: inherit;
		align-items: center;
		font: var(--menu-item-font, var(--f-ui-md-medium));
		letter-spacing: var(--menu-item-letter-spacing, var(--ls-ui-md, var(--f-ui-md-spacing, normal)));
		color: var(--menu-item-color, inherit);
		text-decoration: none;
		white-space: nowrap;
		padding: var(--menu-item-padding, var(--space-sl) 0);
		border-radius: var(--menu-item-border-radius, var(--radius-xs));

		&[aria-current='page'] {
			background: var(--c-box-3);
			color: var(--menu-item-active-color, inherit);
		}

		&:hover {
			background: var(--c-box-2);
		}
	}

	/*
		Set various properties based on Menu settings (see Menu.svelte CSS classes).
		Some coupling here is acceptable b/c Menu and MenuItem should always be used in tandem.
	*/
	:global(.dir--horizontal) a {
		padding: var(--menu-item-padding, var(--space-ss) var(--space-md));
	}
</style>
