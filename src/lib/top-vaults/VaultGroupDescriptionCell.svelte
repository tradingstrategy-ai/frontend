<!--
@component
Renders the optional Markdown description cell on a vault group listing.
-->
<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';

	interface Props {
		description: string;
	}

	let { description }: Props = $props();
</script>

<div class="vault-group-description">
	<Markdown content={description} />
</div>

<style>
	.vault-group-description {
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
		text-align: left;

		:global(.markdown :is(p, li)) {
			margin: 0;
			font: inherit;
			letter-spacing: var(--ls-ui-sm);
		}

		:global(.markdown a) {
			position: relative;
			z-index: 2;
			color: var(--c-text-light);
		}
	}
</style>
