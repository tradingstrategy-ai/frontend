<script>
	import { discordUrl } from '$lib/config';
	import IconGithub from '~icons/local/github';
	import IconDiscord from '~icons/local/discord';
	import IconTelegram from '~icons/local/telegram';
	import IconTwitter from '~icons/local/twitter';
	import IconLinkedin from '~icons/local/linkedin';
	import IconReading from '~icons/local/reading';
	import IconNewpaper from '~icons/local/newspaper';
	import IconRss from '~icons/local/rss';

	export let small = false;
</script>

<footer>
	<div class="social-links" class:small>
		<div class="link-group">
			<a href="https://github.com/tradingstrategy-ai" title="GitHub" target="_blank" rel="noreferrer">
				<IconGithub />
			</a>
			<a href={discordUrl} title="Discord" target="_blank" rel="noreferrer">
				<IconDiscord />
			</a>
			<a href="https://t.me/trading_protocol" title="Telegram" target="_blank" rel="noreferrer">
				<IconTelegram />
			</a>
			<a href="https://twitter.com/tradingprotocol" title="Twitter" target="_blank" rel="noreferrer">
				<IconTwitter />
			</a>
		</div>

		<div class="link-group">
			<a href="https://www.linkedin.com/company/trading-strategy/" title="LinkedIn" target="_blank" rel="noreferrer">
				<IconLinkedin />
			</a>
			<a href="/newsletter" title="Newsletter">
				<IconNewpaper />
			</a>
			<a href="/blog" title="Blog">
				<IconReading />
			</a>
			<a href="/blog/rss.xml" title="RSS" target="_blank">
				<IconRss />
			</a>
		</div>
	</div>

	<div class="disclaimer">
		<a href="https://tradingstrategy.ai">TradingStrategy.ai</a> operated by Trading Strategy Operations Ltd., Victoria, Mahe,
		Seychelles.
	</div>
</footer>

<style>
	footer {
		margin-block: 3.5rem;
		padding-inline: 1.5rem;
	}

	.social-links {
		--icon-size: 1.375rem;
		display: flex;
		flex-wrap: wrap;
		place-content: center;
		gap: 2.25rem;
		padding-block: 4rem;

		@media (--nav-collapsed) {
			padding-block: 1.5rem;
		}

		@media (--viewport-sm-down) {
			--icon-size: 1.25rem;
			gap: 1.75rem;
		}

		&.small {
			--icon-size: 1.25rem;
			gap: 1.75rem;
			padding-top: 0;
		}

		.link-group {
			display: flex;
			gap: inherit;
		}

		a {
			display: flex;
			justify-content: center;
			align-items: center;
			width: calc(var(--icon-size) * 2);
			aspect-ratio: 1;
			border: none;
			border-radius: 100%;
			background: var(--c-text);
			color: var(--c-body);
			transition: opacity var(--time-xs) ease-out;

			&:hover {
				opacity: 0.9;
			}
		}
	}

	.disclaimer {
		text-align: center;
		font: var(--f-ui-xs-roman);
		letter-spacing: var(--f-ui-xs-spacing, normal);
		color: var(--c-text-ultra-light);

		a {
			font-weight: 500;

			&:hover {
				color: var(--c-text-extra-light);
				text-decoration: underline;
			}
		}
	}
</style>
