<script lang="ts">
	import type { Snippet } from 'svelte';
	import './layerchart-tailwind.css';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="tailwind">
	{@render children()}
</div>
