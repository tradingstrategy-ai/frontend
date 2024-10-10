import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

/**
 * Create a progress bar store with custom reset, start and finish methods.
 *
 * @param duration - time in ms to go from 0 to 100
 */
export function getProgressBar(initial = 0, duration: number) {
	const { set, subscribe } = tweened(initial, { duration: 0, easing: cubicOut });

	return {
		subscribe,
		reset: () => set(initial),
		start: (startAt = 0) => {
			set(startAt);
			set(95, { duration: (1 - startAt / 100) * duration });
		},
		finish: (duration = 100) => set(100, { duration })
	};
}
