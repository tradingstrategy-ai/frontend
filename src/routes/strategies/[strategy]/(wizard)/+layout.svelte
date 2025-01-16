<script lang="ts">
	import { page } from '$app/state';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { children } = $props();
	const { title, steps } = page.data;
</script>

<Wizard {title} {steps} route={page.route.id} {children} />
