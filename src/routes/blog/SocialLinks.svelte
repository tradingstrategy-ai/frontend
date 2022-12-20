<script lang="ts">
	import { Icon } from '$lib/components';

	export let layout: 'index' | 'post';
</script>

<div class="layout--{layout}">
	<a href="https://newsletter.tradingstrategy.ai/">
		<Icon name="newspaper" />
		<span class="long-label">Subscribe to our Newsletter</span>
		<span class="short-label">Newsletter</span>
	</a>
	<a href="https://twitter.com/TradingProtocol">
		<Icon name="twitter" />
		<span class="long-label">Follow us on Twitter</span>
		<span class="short-label">Twitter</span>
	</a>
	<a href="/blog/rss.xml" rel="external">
		<Icon name="rss" />
		<span class="long-label">RSS Feed</span>
		<span class="short-label">RSS</span>
	</a>
</div>

<style>
	div {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-md);
	}

	.layout--index {
		flex-direction: row;
	}

	.layout--post {
		flex-direction: column;
		margin-bottom: var(--space-md);
	}

	a {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.layout--post a {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		--icon-size: 20px;
	}

	.layout--index a {
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		--icon-size: 24px;
	}

	a > span {
		text-decoration: none;
		color: var(--c-text-4-v1);
	}

	a:hover > span {
		text-decoration: underline;
		color: var(--c-text-1-v1);
	}

	.layout--post .short-label,
	.layout--index .long-label {
		display: none;
	}

	@media (--viewport-md-up) {
		.layout--index {
			justify-content: start;
			column-gap: 2.5rem;
		}

		.layout--post {
			flex-direction: row;
			margin-bottom: var(--space-xl);
		}

		.layout--post a {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			--icon-size: 24px;
		}

		.layout--index .long-label {
			display: revert;
		}

		.layout--index .short-label {
			display: none;
		}
	}
</style>
