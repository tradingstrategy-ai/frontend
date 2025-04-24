<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		heading?: boolean;
		top?: boolean;
		bottom?: boolean;
		left?: boolean;
		right?: boolean;
		children: Snippet;
	};

	let {
		class: classes = '',
		heading = false,
		bottom = false,
		top = !bottom,
		right = false,
		left = !right,
		children
	} = $props();
</script>

<h3 class={[classes, { heading, top, bottom, left, right }]}>
	{@render children()}
</h3>

<style>
	h3 {
		position: absolute;
		padding: 0.125em 0.25em;
		background: color-mix(in srgb, transparent, var(--c-body) 60%);
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, nornal);
		--margin: 0.25rem;

		&.heading {
			font: var(--f-ui-sm-roman);
			letter-spacing: 0.1em;
			text-transform: uppercase;
		}

		&.top {
			top: var(--margin);
		}

		&.bottom {
			bottom: var(--margin);
		}

		&.left {
			left: var(--margin);
		}

		&.right {
			right: var(--margin);
		}
	}
</style>
