<script context="module" type="ts">
	let initialized = false;

	async function init() {
		if (initialized) {
			return;
		}
		const module = await import(/* @vite-ignore */ 'notebook-webcomponent/notebook.js');
		module.default();
		initialized = true;
	}
</script>

<script type="ts">
	import { pyodideUrl } from '$lib/config';
	import { onMount } from 'svelte';

	export let src: string;

	onMount(init);
</script>

<jupyter-notebook {src} pyodideurl="{pyodideUrl}/pyodide.mjs" />
