/**
 * Svelte action to prevent body from scrolling, e.g., when a modal is open.
 *
 * see: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
 *
 * @param disableScroll - whether to prevent scrolling; typically a prop or stateful variable
 *
 * @usage
 *   <svelte:body use:preventBodyScroll={isDisabled} />
 */
export function disableScroll({ style }: HTMLBodyElement, disableScroll: boolean) {
	let locked = false;
	let scrollY = 0;

	function update(disable: boolean) {
		if (disable && !locked) {
			scrollY = window.scrollY;
			style.top = `-${scrollY}px`;
			style.position = 'fixed';
			style.width = '100%';
			locked = true;
		} else if (!disable && locked) {
			style.top = '';
			style.position = '';
			style.width = '';
			window.scrollTo(0, scrollY);
			locked = false;
		}
	}

	update(disableScroll);

	return {
		update,
		destroy: () => update(false)
	};
}
