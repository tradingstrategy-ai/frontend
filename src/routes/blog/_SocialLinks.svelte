<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	export let compact = false;
	const layout = compact ? 'compact' : 'wide';
</script>

<div class="layout--{layout}">
	<a href="https://newsletter.tradingstrategy.ai/">
		<div style:font-size="24px"><Icon name="newspaper" /></div>
		<span class="long-label">Subscribe to our Newsletter</span>
		<span class="short-label">Newsletter</span>
	</a>
	<a href="https://twitter.com/TradingProtocol">
		<div style:font-size="24px"><Icon name="twitter" /></div>
		<span class="long-label">Follow us on Twitter</span>
		<span class="short-label">Twitter</span>
	</a>
	<a href="/blog/rss.xml" rel="external">
		<div style:font-size="24px"><Icon name="rss" /></div>
		<span class="long-label">RSS Feed</span>
		<span class="short-label">RSS</span>
	</a>
</div>

<style>
	div {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2.5rem;
	}

	.layout--wide {
		flex-direction: column;
		justify-content: start;
		margin-bottom: 1rem;
	}

	.layout--compact {
		justify-content: space-between;
	}

	a {
		display: grid;
		grid-template-columns: repeat(2, max-content);
		align-items: center;
		gap: 0.5em;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
		text-decoration: none;
		color: var(--c-text-4);
	}

	.layout--wide a {
		font: 500 var(--fs-ui-sm);
	}

	a:hover {
		text-decoration: underline;
		color: var(--c-text-1);
	}

	.layout--wide .short-label {
		display: none;
	}

	.layout--compact .long-label {
		display: none;
	}

	@media (min-width: 768px) {
		.layout--wide {
			flex-direction: row;
			margin-bottom: 2rem;
		}

		.layout--compact {
			justify-content: start;
		}

		.layout--wide a {
			font: 500 var(--fs-ui-md);
		}

		.layout--compact .long-label {
			display: revert;
		}

		.layout--compact .short-label {
			display: none;
		}
	}
</style>
