<script>
	import { SocialIcon } from '$lib/components';

	export let skip = false;
	export let small = false;
</script>

<footer class:small>
	{#if !skip}
		<a href="https://discord.gg/en8tW6MDtw">
			<SocialIcon name="discord" />
		</a>

		<a href="https://twitter.com/tradingprotocol">
			<SocialIcon name="twitter" />
		</a>

		<a href="https://www.linkedin.com/company/trading-strategy/">
			<SocialIcon name="linkedin" />
		</a>

		<a href="https://newsletter.tradingstrategy.ai/">
			<SocialIcon name="newspaper" />
		</a>

		<a href="/blog/rss.xml" rel="external">
			<SocialIcon name="rss" />
		</a>
	{/if}
</footer>

<style>
	footer {
		display: grid;
		grid-auto-flow: column;
		justify-content: center;
		gap: 1.25rem;
		padding: 2.5rem 1rem;
	}

	footer.small {
		--social-icon-size: 44px;
	}

	a {
		transition: opacity 0.15s;
	}

	a:hover {
		opacity: 0.9;
	}

	@media (--viewport-md-up) {
		footer:not(.small) {
			gap: 2.5rem;
			padding: 5rem 0;
		}
	}
</style>
