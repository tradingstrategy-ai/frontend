<script>
	import { SocialIcon } from '$lib/components';

	export let skip = false;
	export let small = false;
</script>

<footer class:small>
	{#if !skip}
		<div class="icon-group">
			<SocialIcon {small} name="github" href="https://github.com/tradingstrategy-ai" title="GitHub" />
			<SocialIcon {small} name="discord" href="https://discord.gg/en8tW6MDtw" title="Discord" />
			<SocialIcon {small} name="telegram" href="https://t.me/trading_protocol" title="Telegram" />
			<SocialIcon {small} name="twitter" href="https://twitter.com/tradingprotocol" title="Twitter" />
		</div>

		<div class="icon-group">
			<SocialIcon {small} name="linkedin" href="https://www.linkedin.com/company/trading-strategy/" title="LinkedIn" />
			<SocialIcon {small} name="newspaper" title="Newsletter" href="/newsletter" />
			<SocialIcon {small} name="reading" title="Newsletter" href="/blog" />
			<SocialIcon {small} external name="rss" href="/blog/rss.xml" title="RSS" />
		</div>
	{/if}
</footer>

<style lang="postcss">
	footer {
		display: flex;
		flex-wrap: wrap;
		place-content: center;
		gap: var(--space-2xl);
		margin-top: var(--space-6xl);
		padding-inline: var(--space-lg);
		padding-block: var(--space-7xl);

		@media (--nav-collapsed) {
			padding-block: var(--space-lg);
		}

		@media (--viewport-sm-down) {
			gap: var(--space-ll);
		}

		&.small {
			gap: var(--space-ll);
			padding-block: 0;
		}

		& .icon-group {
			display: flex;
			gap: inherit;
		}
	}
</style>
