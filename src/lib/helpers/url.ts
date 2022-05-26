/**
 * https://svelte.dev/repl/5abaac000b164aa1aacc6051d5c4f584?version=3.43.1
 */

import { current_component } from 'svelte/internal';
import { derived, writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

const href = writable(isBrowser ? window.location.href : 'https://example.com');

const URL = isBrowser ? window.URL : require('url').URL;

if (isBrowser) {
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	const updateHref = () => href.set(window.location.href);

	history.pushState = function () {
		originalPushState.apply(this, arguments);
		updateHref();
	};

	history.replaceState = function () {
		originalReplaceState.apply(this, arguments);
		updateHref();
	};

	window.addEventListener('popstate', updateHref);
	window.addEventListener('hashchange', updateHref);
}

export default {
	subscribe: derived(href, ($href) => new URL($href)).subscribe,
	ssrSet: (urlHref) => href.set(urlHref)
};
