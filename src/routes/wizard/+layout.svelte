<script lang="ts">
	import { page } from '$app/state';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { children } = $props();

	let { steps, title } = $derived(page.data);
</script>

<Wizard {steps} {title} route={page.route.id} {children} />
