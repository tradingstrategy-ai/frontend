export function getCssColors<T extends string>(variableNames: T[]): Record<T, string | undefined> {
	const el = document.createElement('div');
	document.body.appendChild(el);

	const colors = {} as Record<T, string | undefined>;
	for (const varName of variableNames) {
		el.style.color = `var(--c-${varName})`;
		colors[varName] = getComputedStyle(el).color;
	}

	document.body.removeChild(el);
	return colors;
}
