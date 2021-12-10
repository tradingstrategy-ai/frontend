<script>
    /**
     * Svelte does not give a load indication if you hit a link that leads to a page with slow load() function.
     * Svelte uses internal router, not server-side loading.
	 * Thus, we need to manually give some indication in the user interface if the loading takes more than a blink of an eye.
	 *
	 * Based on the original implementation https://github.com/shajidhasan/sveltekit-page-progress-demo by Shajid Hasan
     */
	import { onDestroy, onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import navigationState from '../../stores/navigation';

	const progress = tweened(0, {
		duration: 3500,
		easing: cubicOut
	});
	const unsubscribe = navigationState.subscribe((state) => {
		if (state === 'loaded') {
			progress.set(1, { duration: 1000 });
		}
	});
	onMount(() => {
		progress.set(0.7);
	});
	onDestroy(() => {
		unsubscribe();
	});
</script>


<div class="progress-bar">
	<div class="progress-sliver" style={`--width: ${$progress * 100}%`} />
</div>

<style>
	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 0.5rem;
	}
	.progress-sliver {
		width: var(--width);
		background-color: #f8485e;
		height: 100%;
	}
</style>
