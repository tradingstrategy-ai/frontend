<!--
@component
Reusable horizontal or vertical list for navigation items.

Use `align` to position the items within the available space.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Alignment = 'left' | 'center' | 'right';

	interface Props {
		horizontal?: boolean;
		align?: Alignment;
		children?: Snippet;
	}

	let { horizontal = false, align = 'left', children }: Props = $props();
	let direction = $derived(horizontal ? 'horizontal' : 'vertical');
</script>

<menu class="dir--{direction} align--{align}">
	{@render children?.()}
</menu>

<style>
	@custom-media --bigger-gap (width > 1480px);
	@custom-media --smaller-gap (width <= 1260px);
	menu {
		display: flex;
		gap: var(--menu-gap, var(--space-lg));
		@media (--bigger-gap) {
			gap: var(--menu-gap, var(--space-xl));
		}
		@media (--smaller-gap) {
			gap: var(--menu-gap, var(--space-sm));
		}
		margin: 0;
		padding: 0;

		&.dir--vertical {
			flex-direction: column;
		}

		&.dir--horizontal {
			flex-direction: row;
		}

		&.align--left {
			justify-content: left;
		}

		&.align--center {
			justify-content: center;
		}

		&.align--right {
			justify-content: right;
		}
	}
</style>
