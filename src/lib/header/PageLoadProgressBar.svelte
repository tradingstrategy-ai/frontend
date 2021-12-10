<script>
    /**
     * Svelte does not give a load indication if you hit a link that leads to a page with slow load() function.
     * Svelte uses internal router, not server-side loading.
	 * Thus, we need to manually give some indication in the user interface if the loading takes more than a blink of an eye.
	 *
	 * The component is originally made for https://tradingstrategy.ai
	 *
	 * Based on the original implementation https://github.com/shajidhasan/sveltekit-page-progress-demo by Shajid Hasan.
	 *
	 * As this component is absolutely position, you can put it at any part of your __layout.svelte.
     */
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const navigationState = writable();

	const progress = tweened(0, {
		duration: 3500,
		easing: cubicOut
	});

	const unsubscribe = navigationState.subscribe((state) => {

		// You will always get state=undefined
		// event on the server-side rendering, so
		// safely ignore it
		//console.log("The loading state is", state);

		if (state === 'loading-with-progress-bar') {
			progress.set(0, { duration: 0 });
			progress.set(0.8, { duration: 5000 });
		} else if (state === 'loaded') {
			progress.set(1, { duration: 1000 });
		}
	});

	onMount(() => {
		// progress.set(0.7);
	});
	onDestroy(() => {
		unsubscribe();
	});
</script>

<!-- See the (little) documentation of special SvelteKit events here https://kit.svelte.dev/docs#events -->
<svelte:window
	on:sveltekit:navigation-start={() => {

		// If the page loads fast enough in the preloading state,
		// never display the progress bar
		$navigationState = 'preloading';

        // Delay the progress bar to become visible an eyeblink... only show if the page load takes too long
        setTimeout(function() {
			// After 250ms switch preloading to loading-with-progress-bar
            if($navigationState === 'preloading') {
                $navigationState = 'loading-with-progress-bar';
            }
        }, 500);
	}}
	on:sveltekit:navigation-end={() => {
		$navigationState = 'loaded';
	}}
/>

<!--
	Make sure the container component is always in the DOM structure.

	If we make changes to the page structure during the navigation, we get a page double render error:
	https://stackoverflow.com/questions/70051025/sveltekit-adds-new-page-on-top-of-old-one

	Not sure if this is a bug or a feature.
	Thus, make sure any progress animation is done using CSS only.
-->
<div class="page-progress-bar" class:loaded={$navigationState === 'loaded'} class:preloading={$navigationState === 'preloading'} class:loading={$navigationState === 'loading-with-progress-bar'}>
	<div class="progress-sliver" style={`--width: ${$progress * 100}%`} />
</div>

<style>
	 /* Always stay fixed at the top, but stay transparent if no activity is going on */
	.page-progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 0.5rem;
		background: transparent;
		z-index: 100;
		opacity: 0;
		transition: opacity 0.5s;
	}

	 /* After transitioning from preloading to loading state, make the progress bar visible with CSS transition on opacity */
	.page-progress-bar.loading {
		opacity: 1;
		transition: opacity 0.5s;
	}

	.progress-sliver {
		width: var(--width);
		background-color: var(--price-up-green);
		height: 100%;
	}
</style>
