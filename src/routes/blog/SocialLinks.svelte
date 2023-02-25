<script lang="ts">
	import { Button, Icon } from '$lib/components';

	export let layout: 'index' | 'post';
</script>

<div class="social-links layout--{layout}">
	<Button icon="newspaper" href="/newsletter" size="sm">
		<span class="long-label">Subscribe to our Newsletter</span>
		<span class="short-label">Newsletter</span>
	</Button>
	<Button icon="twitter" href="https://twitter.com/TradingProtocol" size="sm">
		<span class="long-label">Follow us on Twitter</span>
		<span class="short-label">Twitter</span>
	</Button>
	<Button icon="rss" href="/blog/rss.xml" rel="external" size="sm">
		<span class="long-label">RSS Feed</span>
		<span class="short-label">RSS</span>
	</Button>
</div>

<style lang="postcss">
	.social-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-md);

		& :global .button {
			--icon-size: 1.125rem !important;
		}
	}

	.layout--index {
		flex-direction: row;

		@media (--viewport-sm-down) {
			flex-direction: column;
		}
	}

	.layout--post {
		flex-direction: column;
		margin-bottom: var(--space-md);
	}

	.layout--post .short-label,
	.layout--index .long-label {
		display: none;
	}

	@media (--viewport-md-up) {
		.layout--index {
			justify-content: start;
			column-gap: var(--space-md);
		}

		.layout--post {
			flex-direction: row;
			margin-bottom: var(--space-xl);
		}

		.layout--index .long-label {
			display: revert;
		}

		.layout--index .short-label {
			display: none;
		}
	}
</style>
