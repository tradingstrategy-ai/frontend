<script lang="ts">
	import { page } from '$app/state';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { data, children } = $props();
</script>

<Wizard {...data} route={page.route.id} {children} />
