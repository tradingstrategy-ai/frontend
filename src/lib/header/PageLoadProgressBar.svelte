<!--
@component
SvelteKit does not provide a load indicator when you navigate to a page with
slow `load()` function. SvelteKit uses an internal router, not server-side
loading. Thus, we need to manually provide some indication in the UI if page
exceeds a tenth of a second. Component is absolutely positioned – include it
anywhere in `__layout.svelte`.

Based on the original implementation by Shajid Hasan:
https://github.com/shajidhasan/sveltekit-page-progress-demo

#### Usage:
```tsx
<PageLoadProgressBar />
```
-->
<script>
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const navigationState = writable();

	const progress = tweened(0, {
		duration: 3500,
		easing: cubicOut
	});

	const unsubscribe = navigationState.subscribe((state) => {
		// `state` will always be `undefined` for SSR, so safely ignore it
		if (state === 'loading-with-progress-bar') {
			progress.set(0, { duration: 0 });
			progress.set(0.8, { duration: 5000 });
		} else if (state === 'loaded') {
			progress.set(1, { duration: 1000 });
		}
	});

	function handleNavStart() {
		// Don't show progress bar if the page loads fast enough in preloading state
		$navigationState = 'preloading';

		// Display progress bar if page load > 250 ms
		setTimeout(function() {
			if ($navigationState === 'preloading') {
				$navigationState = 'loading-with-progress-bar';
			}
		}, 500);
	}

	onDestroy(unsubscribe);
</script>

<!-- See the (little) documentation of special SvelteKit events here https://kit.svelte.dev/docs#events -->
<svelte:window
	on:sveltekit:navigation-start={handleNavStart}
	on:sveltekit:navigation-end={() => navigationState.set('loaded')}
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
