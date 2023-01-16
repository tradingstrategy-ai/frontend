<!--
@component
Based on the original work of Denis Stasyev = https://github.com/denisstasyev/svelte-skeleton
Modified for resizeablility and mobile friendliness.

#### Usage:
```tsx
	<Skeleton layout="full|line" />
```
-->
<script lang="ts">
	export let layout: 'full' | 'line';

	export let height = 200;
	export let width = 400;
	export let speed = 2;
	export let animate = true;
	export let secondaryColorPercentWidth = 100;

	let idClip = getUniqueId();
	let idGradient = getUniqueId();

	function getUniqueId() {
		return Math.random().toString(36).substring(2);
	}
</script>

<svg viewBox="0 0 100 100" class="skeleton-{layout}" aria-labelledby="loading-aria" preserveAspectRatio="none">
	<rect fill="url(#{idGradient})" clip-path="url(#{idClip})" {width} {height} x="0" y="0" />
	<defs>
		<clipPath id={idClip}>
			<slot>
				<rect width="100%" height="100%" x="0" y="0" rx="1" ry="1" />
			</slot>
		</clipPath>
		<linearGradient id={idGradient} x1="-{secondaryColorPercentWidth}%" y1="50%" x2="0%" y2="50%">
			{#if animate}
				<animate
					attributeName="x1"
					from="-{secondaryColorPercentWidth}%"
					to="100%"
					dur="{speed}s"
					repeatCount="indefinite"
				/>
				<animate
					attributeName="x2"
					from="0%"
					to="{100 + secondaryColorPercentWidth}%"
					dur="{speed}s"
					repeatCount="indefinite"
				/>
			{/if}

			<stop offset="0%" />
			<stop offset="50%" />
			<stop offset="100%" />
		</linearGradient>
	</defs>
</svg>

<style>
	.skeleton-full {
		width: 100%;
		max-height: 80vh;
	}

	.skeleton-line {
		width: 100%;
		min-width: 60px;
		max-height: 1rem;
		display: inline-block;
	}

	stop:nth-child(odd) {
		stop-color: hsla(var(--hsl-body));
	}

	stop:nth-child(even) {
		stop-color: var(--c-background-2-v1);
	}
</style>
