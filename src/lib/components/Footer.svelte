<script>
	import { discordUrl } from '$lib/config';
	import { SocialIcon } from '$lib/components';

	export let small = false;
</script>

<footer class:small>
	<div class="icon-group">
		<SocialIcon
			{small}
			name="github"
			href="https://github.com/tradingstrategy-ai"
			title="GitHub"
			target="_blank"
			rel="noreferrer"
		/>
		<SocialIcon {small} name="discord" href={discordUrl} title="Discord" target="_blank" rel="noreferrer" />
		<SocialIcon
			{small}
			name="telegram"
			href="https://t.me/trading_protocol"
			title="Telegram"
			target="_blank"
			rel="noreferrer"
		/>
		<SocialIcon
			{small}
			name="twitter"
			href="https://twitter.com/tradingprotocol"
			title="Twitter"
			target="_blank"
			rel="noreferrer"
		/>
	</div>

	<div class="icon-group">
		<SocialIcon
			{small}
			name="linkedin"
			href="https://www.linkedin.com/company/trading-strategy/"
			title="LinkedIn"
			target="_blank"
			rel="noreferrer"
		/>
		<SocialIcon {small} name="newspaper" title="Newsletter" href="/newsletter" />
		<SocialIcon {small} name="reading" title="Blog" href="/blog" />
		<SocialIcon {small} name="rss" href="/blog/rss.xml" title="RSS" target="_blank" />
	</div>
</footer>

<div class="disclaimer">
	<a href="https://tradingstrategy.ai">TradingStrategy.ai</a> operated by Trading Strategy Operations Ltd., Victoria, Mahe,
	Seychelles.
</div>

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

		.icon-group {
			display: flex;
			gap: inherit;
		}
	}

	.disclaimer {
		text-align: center;
		font: var(--f-ui-xs-roman);
		padding-block: var(--space-7xl);
		padding-top: 0;
		color: var(--c-text-ultra-light);

		& a {
			font: var(--f-ui-xs-medium);
			color: var(--c-text-ultra-light);
		}
	}
</style>
