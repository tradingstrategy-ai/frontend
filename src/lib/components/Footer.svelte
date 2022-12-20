<script>
	import { SocialIcon } from '$lib/components';

	export let skip = false;
	export let small = false;
</script>

<footer class:small>
	{#if !skip}
		<a href="https://discord.gg/en8tW6MDtw" title="Discord">
			<SocialIcon name="discord" />
		</a>

		<a href="https://twitter.com/tradingprotocol" title="Twitter">
			<SocialIcon name="twitter" />
		</a>

		<a href="https://www.linkedin.com/company/trading-strategy/" title="LinkedIn">
			<SocialIcon name="linkedin" />
		</a>

		<a href="https://newsletter.tradingstrategy.ai/" title="Newsletter">
			<SocialIcon name="newspaper" />
		</a>

		<a href="/blog/rss.xml" rel="external" title="RSS">
			<SocialIcon name="rss" />
		</a>
	{/if}
</footer>

<style lang="postcss">
	footer {
		display: grid;
		grid-auto-flow: column;
		justify-content: center;
		gap: 2.5rem;
		padding: 5rem 0;

		@media (--viewport-sm-down) {
			gap: var(--space-lg);
			padding: 2.5rem var(--space-md);
		}

		&.small {
			--social-icon-size: 44px;
			gap: var(--space-lg);
			padding: 0;
		}
	}

	a {
		transition: opacity 0.15s;

		&:hover {
			opacity: 0.9;
		}
	}
</style>
