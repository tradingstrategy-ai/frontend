<script lang="ts">
	import type { Snippet } from 'svelte';

	type Alignment = 'left' | 'center' | 'right';

	interface Props {
		horizontal?: boolean;
		align?: Alignment;
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
	}

	let { horizontal = false, align = 'left', children, onclick }: Props = $props();
	let direction = $derived(horizontal ? 'horizontal' : 'vertical');
</script>

<!-- Clicks originate from interactive child navigation links. -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<menu class="dir--{direction} align--{align}" {onclick}>
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
