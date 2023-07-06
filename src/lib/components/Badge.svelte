<!--
@component
Badge component used for inline text labels.

#### Usage:
```tsx
	<Badge secondary text="foo" />
```
-->
<script lang="ts">
	export let text = '';
	export let secondary = false;

	$: kind = secondary ? 'secondary' : 'primary';
</script>

<span class="badge {kind}">
	{text}
</span>

<style lang="postcss">
	.badge {
		display: inline-block;
		font: 700 10px/12px var(--ff-ui);
		letter-spacing: 0.02em;
		text-transform: uppercase;
		padding: 3px 4px;
		vertical-align: middle;
	}

	.primary {
		color: var(--c-text-light);
	}

	.secondary {
		background: orange;
		color: white;
	}
</style>
