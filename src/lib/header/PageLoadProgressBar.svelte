<!--
@component
Display a loading indicator during client-side routing. Invoked when a page
`load` function takes longer than 250ms to complete. The component uses
`fixed` positioning – it may be included anywhere in the page layout.

#### Usage:
```tsx
	<PageLoadProgressBar />
```
-->
<script context="module" lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import fsm from 'svelte-fsm';

	const progress = tweened(0, { easing: cubicOut });

	/**
	 * Using Finite State Machine for more predictable behavior. Using the
	 * module context so the FSM is a singleton (in case the component gets
	 * unmounted / re-added, which can occur in dev mode).
	 * See: https://github.com/kenkunz/svelte-fsm/
	 */
	const state = fsm('loaded', {
		loaded: {
			load: 'preloading'
		},

		preloading: {
			_enter() {
				progress.set(0, { duration: 0 });
				this.advance.debounce(250);
			},
			advance: 'loading',
			complete: 'loaded'
		},

		loading: {
			_enter() {
				progress.set(0.8, { duration: 5000 });
			},
			_exit() {
				progress.set(1, { duration: 1000 });
			},
			complete: 'loaded'
		}
	});
</script>

<script>
	import { navigating } from '$app/stores';
	$: $navigating ? state.load() : state.complete();
</script>

<progress class={$state} value={$progress} />

<style>
	progress {
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 0.5rem;
		z-index: 100;
		border: none;
		background: transparent;
		opacity: 0;
		transition: opacity 0.5s;
	}

	progress.loading {
		opacity: 1;
	}

	progress::-webkit-progress-bar {
		background: transparent;
	}

	progress::-webkit-progress-value,
	progress::-moz-progress-bar {
		background: var(--price-up-green);
	}
</style>
