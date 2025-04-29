import { serialize } from 'cookie';
import { camelToKebab } from './formatters';
import { type ColorMode, colorModeEnum } from '$lib/schemas/utility';

/**
 * Extract CSS colors from an element; only works client-side.
 *
 * @param el - an HTML element in the DOM
 * @param colorNames - array of color names in camelCase format (e.g., textLight for --c-text-light)
 * @returns record of color names mapped to CSS colors
 */
export function getCssColors<T extends string>(el: HTMLElement, colorNames: readonly T[]): Record<T, string> {
	if (typeof getComputedStyle === 'undefined') {
		throw new Error('getComputedStyle not defined; only available client-side.');
	}

	const style = getComputedStyle(el);
	const colors = {} as Record<T, string>;

	for (const name of colorNames) {
		el.style.color = `var(--c-${camelToKebab(name)})`;
		colors[name] = colorToRgb(style.color);
	}

	return colors;
}

/**
 * Convert a CSS color from `color(srgb ...)` format to `rgb(...)` format.
 * This is needed for TradingView Lightweight Charts as it doesn't support `color(rgb ...)`
 */
function colorToRgb(color: string) {
	const match = color.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
	if (!match) return color;

	const [_, r, g, b, a] = match;
	const alpha = a ? ` / ${a}` : '';
	return `rgb(${toPct(r)} ${toPct(g)} ${toPct(b)}${alpha})`;
}

function toPct(val: string) {
	return `${Number(val) * 100}%`;
}

/**
 * Returns the current user-configured color mode.
 *
 * @throws Error when called outside of browser context (requires `document`)
 */
export function getColorMode(): ColorMode {
	if (!document) throw new Error('No `document` global (should only be called in browser context)');

	return colorModeEnum.catch('dark').parse(document.documentElement.dataset.colorMode);
}

/**
 * Sets the current user-configured color mode.
 *
 * @throws Error when called outside of browser context (requires `document`)
 */
export function setColorMode(mode: ColorMode) {
	if (!document) throw new Error('No `document` global (should only be called in browser context)');

	document.documentElement.dataset.colorMode = mode;
	document.cookie = serialize('ts-color-mode', mode, {
		path: '/',
		maxAge: 5 * 365 * 24 * 60 * 60
	});
}
