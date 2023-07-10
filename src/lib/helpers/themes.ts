/**
 * Theme and colour helpers.
 */

// List of variobles in color.css, others
// Each gets
const cssVars = [
	'--c-text-light',
	'--hsl-text',
	'--hsl-body',
	'--hsl-bullish',
	'--hsl-bearish',
	'--c-background-1',
	'--c-background-2',
	'--c-background-3',
	'--c-background-4',
	'--c-background-5',
	'--c-background-6',
	'--c-background-7'
];

/**
 * Get currently active CSS theme variables.
 *
 * Can be then passed e.g. to SVG rendering.
 *
 * Must be called in onMount
 */
export function readCSSThemeVars(): Map<string, string> {
	const bodyStyles = window.getComputedStyle(document.body);
	const iterable = cssVars.map((name) => {
		return [name, bodyStyles.getPropertyValue(name)];
	});
	return new Map(iterable);
}
