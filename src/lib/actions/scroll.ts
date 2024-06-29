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
	function update(disable: boolean) {
		if (disable) {
			style.top = `-${window.scrollY}px`;
			style.position = 'fixed';
			style.width = '100%';
		} else {
			const scrollY = style.top;
			style.top = '';
			style.position = '';
			style.width = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
		}
	}

	update(disableScroll);

	return {
		update,
		destroy: () => update(false)
	};
}
