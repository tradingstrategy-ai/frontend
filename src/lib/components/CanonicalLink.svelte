<!--
@component
Emit `<link rel="canonical">` for the current page (origin + pathname, no query string).

Use on routes that do not already declare a canonical through `svelte-meta-tags` /
`SocialCardMetaTags` — a page must never end up with two canonical links, which search
engines treat as none. The value is derived from `page.url`, so it updates on client-side
navigation.

@example

```svelte
	<CanonicalLink />
```

For routes keyed by EVM addresses (accepted in any casing):

```svelte
	<CanonicalLink lowercasePath />
``` -->
<script lang="ts">
	import { page } from '$app/state';
	import { getCanonicalUrl } from '$lib/helpers/canonical';

	interface Props {
		/** Lowercase the path, for routes keyed by EVM addresses accepted in any casing. */
		lowercasePath?: boolean;
	}

	let { lowercasePath = false }: Props = $props();

	let href = $derived(getCanonicalUrl(page.url, { lowercasePath }));
</script>

<svelte:head>
	<link rel="canonical" {href} />
</svelte:head>
