<script lang="ts">
	import { Icon } from '$lib/components';

	export let layout: 'index' | 'post';
</script>

<div class="social-links layout--{layout}">
	<a class="social-link" href="/newsletter">
		<Icon name="newspaper" />
		<span class="long-label">Subscribe to our Newsletter</span>
		<span class="short-label">Newsletter</span>
	</a>
	<a class="social-link" href="https://twitter.com/TradingProtocol">
		<Icon name="twitter" />
		<span class="long-label">Follow us on Twitter</span>
		<span class="short-label">Twitter</span>
	</a>
	<a class="social-link" href="/blog/rss.xml" rel="external">
		<Icon name="rss" />
		<span class="long-label">RSS Feed</span>
		<span class="short-label">RSS</span>
	</a>
</div>

<style lang="postcss">
	.social-links {
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

	.social-link {
		display: flex;
		align-items: center;
		gap: 0.5em;
		border: none;
		background: transparent;
		padding: 0;

		@nest .layout--post & {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			--icon-size: 20px;
		}

		@nest .layout--index & {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			--icon-size: 24px;
		}

		& > span {
			text-decoration: none;
			color: var(--c-text-light);
		}

		&:hover > span {
			text-decoration: underline;
			color: var(--c-text-light);
		}
	}

	.layout--post .short-label,
	.layout--index .long-label {
		display: none;
	}

	@media (--viewport-md-up) {
		.layout--index {
			justify-content: start;
			column-gap: var(--space-3xl);
		}

		.layout--post {
			flex-direction: row;
			margin-bottom: var(--space-xl);
		}

		.layout--post .social-link {
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
