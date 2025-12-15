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
		class: classes,
		heading = false,
		bottom = false,
		top = !bottom,
		right = false,
		left = !right,
		children
	}: Props = $props();
</script>

<h3 class={[classes, { heading, top, bottom, left, right }]}>
	{@render children()}
</h3>

<style>
	h3 {
		position: absolute;
		--margin: 0.375rem;
		margin-block: var(--margin);
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, nornal);

		&.heading {
			font: var(--f-ui-sm-roman);
			letter-spacing: 0.1em;
			text-transform: uppercase;
		}

		&.top {
			top: 0;
		}

		&.bottom {
			bottom: 0;
		}

		&.left {
			left: 0;
		}

		&.right {
			right: 0;
		}
	}
</style>
