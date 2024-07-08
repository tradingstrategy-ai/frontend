/**
 * Svelte action to remove an image when it fails to load.
 *
 * @usage
 *   <img src={url} alt="image" use:removeOnError />
 */
export function removeOnError(node: HTMLImageElement) {
	const remove = () => node.remove();
	node.addEventListener('error', remove);
	return {
		destroy: () => node.removeEventListener('error', remove)
	};
}
