<!--
@component
Create a link for a "targetable" container, such as a content tile or table row.
The link is positioned to cover the entire container, making the whole area act
as the link target.

@param label screen reader label (not visibly displayed)

@example

```svelte
<div class="content-tile targetable">
	<TargetableLink href="http://example.com" label="View details">
	<span>Some other tile content</span>
  <button class="targetable-above">Above tile target</button>
</div>
```
-->
<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Props = HTMLAnchorAttributes & {
		label: string;
	};

	let { label, ...rest }: Props = $props();
</script>

<a {...rest}>
	<span class="sr-only">{label}</span>
</a>

<style>
	/* positioned anchor element covers whole taregetable container */
	a {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	/* intentionally unscoped global - apply to targetable container */
	:global(.targetable) {
		position: relative;

		/* raise nested targetable elements above positioned anchor */
		:global(.targetable-above) {
			position: relative;
			z-index: 2;
		}
	}
</style>
