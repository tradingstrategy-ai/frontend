<!--
@component
Markdown vault description with a faded preview for long content.
Short descriptions and pages without JavaScript show the complete text.

@example

```svelte
	<VaultDescription content={vault.description} />
```
-->
<script lang="ts">
	import { tick } from 'svelte';
	import Markdown from '$lib/components/Markdown.svelte';

	let { content }: { content: string } = $props();
	const id = $props.id();
	const previewLines = 16;
	let preview: HTMLDivElement;
	let body: HTMLDivElement;
	let expandable = $state(false);
	let expanded = $state(false);
	let collapsed = $derived(expandable && !expanded);

	$effect(() => {
		if (!preview || !body || !content) return;
		expanded = false;

		const measure = () => {
			const lineHeight = Number.parseFloat(getComputedStyle(preview).lineHeight);
			expandable = body.getBoundingClientRect().height > previewLines * lineHeight + 1;
		};
		const observer = new ResizeObserver(measure);
		observer.observe(body);
		measure();
		return () => observer.disconnect();
	});

	function toggle() {
		expanded = !expanded;
		if (!expanded && preview.getBoundingClientRect().top < 0) {
			preview.scrollIntoView({ block: 'start' });
		}
	}

	/**
	 * Reveal clipped links before scrolling keyboard focus into view.
	 * @param event Focus entering the description.
	 */
	async function revealFocusedContent(event: FocusEvent) {
		if (!collapsed) return;
		expanded = true;
		await tick();
		if (event.target instanceof HTMLElement) {
			event.target.scrollIntoView({ block: 'nearest' });
		}
	}
</script>

<div class="vault-description" style:--preview-lines={previewLines}>
	<div {id} class="preview" class:collapsed bind:this={preview} onfocusin={revealFocusedContent}>
		<div class="body" bind:this={body}>
			<Markdown {content} />
		</div>
	</div>
	{#if expandable}
		<button type="button" aria-expanded={expanded} aria-controls={id} onclick={toggle}>
			{expanded ? 'View less' : 'View more'}
		</button>
	{/if}
</div>

<style>
	.vault-description {
		min-width: 0;
	}

	.preview {
		font: var(--f-paragraph-lg-roman);
		scroll-margin-block-start: var(--space-xl);

		@media (--viewport-sm-down) {
			font: var(--f-paragraph-md-roman);
		}

		&.collapsed {
			max-block-size: calc(var(--preview-lines) * 1lh);
			overflow: hidden;
			mask-image: linear-gradient(to bottom, black calc(100% - 3lh), transparent);
		}
	}

	.body {
		display: flow-root;

		:global(.markdown > :last-child) {
			margin-bottom: 0;
		}
	}

	button {
		display: block;
		margin-block-start: var(--space-md);
		padding: var(--space-xs) 0;
		border: 0;
		background: transparent;
		color: var(--c-text-light);
		font: var(--f-ui-md-medium);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;

		&:hover {
			color: var(--c-text);
		}

		&:focus-visible {
			outline: 2px solid var(--c-text-light);
			outline-offset: var(--space-xxs);
		}
	}
</style>
