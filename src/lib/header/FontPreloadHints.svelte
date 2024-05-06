<!--
@component
Generate <link rel="preload" /> hints for the most commonly used fonts in our design system.
This optimizes font-loading speed on first page load so the preferred font is more
likely to be displayed vs. fallback system font. Fonts should be cached after first
page load. Only rendered during SSR, and only if `deps/fonts` submodule is installed.

#### Usage:
```tsx
<FontPreloadHints />
```
-->
<script lang="ts" context="module">
	import { browser, dev } from '$app/environment';

	const fonts = [
		'NeueHaasGroteskDisplay/65.woff2',
		'NeueHaasGroteskDisplay/75.woff2',
		'NeueHaasGroteskText/55.woff2',
		'SourceSerifPro/latin-400-normal.woff2'
	];

	// get all design-system-font asset paths (optional module - may be empty)
	const allFonts = import.meta.glob('design-system-fonts/**/*.woff2', {
		query: '?url',
		import: 'default',
		eager: true
	});

	const fontPaths: string[] = [];

	for (const path in allFonts) {
		for (const font of fonts) {
			if (path.includes(font)) fontPaths.push(allFonts[path] as string);
		}
	}
</script>

{#if !(browser || dev)}
	{#each fontPaths as fontPath}
		<link rel="preload" href={fontPath} as="font" crossorigin="anonymous" />
	{/each}
{/if}
