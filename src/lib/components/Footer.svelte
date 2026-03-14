<script>
	import { Tooltip } from '$lib/components';
	import { discordUrl } from '$lib/config';
	import IconGithub from '~icons/local/github';
	import IconDiscord from '~icons/local/discord';
	import IconTelegram from '~icons/local/telegram';
	import IconTwitter from '~icons/local/twitter';
	import IconLinkedin from '~icons/local/linkedin';
	import IconRss from '~icons/local/rss';

	export let small = false;
</script>

<footer>
	<div class="social-links" class:small>
		<div class="link-group">
			<Tooltip>
				<a
					slot="trigger"
					href="https://github.com/tradingstrategy-ai"
					aria-label="GitHub"
					target="_blank"
					rel="noreferrer"
				>
					<IconGithub />
				</a>
				<div slot="popup">GitHub</div>
			</Tooltip>
			<Tooltip>
				<a slot="trigger" href={discordUrl} aria-label="Discord" target="_blank" rel="noreferrer">
					<IconDiscord />
				</a>
				<div slot="popup">Discord</div>
			</Tooltip>
			<Tooltip>
				<a slot="trigger" href="https://t.me/trading_protocol" aria-label="Telegram" target="_blank" rel="noreferrer">
					<IconTelegram />
				</a>
				<div slot="popup">Telegram</div>
			</Tooltip>
			<Tooltip>
				<a
					slot="trigger"
					href="https://twitter.com/tradingprotocol"
					aria-label="Twitter"
					target="_blank"
					rel="noreferrer"
				>
					<IconTwitter />
				</a>
				<div slot="popup">Twitter</div>
			</Tooltip>
		</div>

		<div class="link-group">
			<Tooltip>
				<a
					slot="trigger"
					href="https://www.linkedin.com/company/trading-strategy/"
					aria-label="LinkedIn"
					target="_blank"
					rel="noreferrer"
				>
					<IconLinkedin />
				</a>
				<div slot="popup">LinkedIn</div>
			</Tooltip>
			<Tooltip>
				<a slot="trigger" href="/blog/rss.xml" aria-label="RSS" target="_blank">
					<IconRss />
				</a>
				<div slot="popup">RSS</div>
			</Tooltip>
		</div>
	</div>

	<div class="disclaimer">
		<a href="https://tradingstrategy.ai">TradingStrategy.ai</a> operated by Trading Strategy DAO LLC. Majuro, Marshall Islands.
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

		:global(.tooltip) {
			position: relative;
			display: flex;
		}

		:global(.tooltip .popup) {
			top: calc(100% + 0.35rem);
			left: 50%;
			transform: translateX(-50%);
			width: max-content;
			padding-top: 0;
		}

		:global(.tooltip .popup .inner) {
			padding: 0.55rem 0.7rem;
			border-color: color-mix(in srgb, var(--c-box-4), var(--c-text-light) 14%);
			background: color-mix(in srgb, var(--c-text-inverted), var(--c-box-1) 18%);
			backdrop-filter: blur(0.65rem) saturate(1.15);
			font: var(--f-ui-xs-medium);
			letter-spacing: var(--f-ui-xs-spacing, normal);
			white-space: nowrap;
		}

		a {
			position: relative;
			overflow: hidden;
			display: flex;
			justify-content: center;
			align-items: center;
			width: calc(var(--icon-size) * 2);
			aspect-ratio: 1;
			border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 16%);
			border-radius: 100%;
			background:
				linear-gradient(
					180deg,
					color-mix(in srgb, white, transparent 84%) 0%,
					color-mix(in srgb, var(--c-box-2), transparent 12%) 100%
				),
				radial-gradient(
					circle at 28% 24%,
					color-mix(in srgb, var(--c-text-light), transparent 76%) 0%,
					transparent 40%
				),
				color-mix(in srgb, var(--c-box-2), transparent 8%);
			color: color-mix(in srgb, var(--c-text), var(--c-text-light) 18%);
			box-shadow:
				0 0.8rem 1.8rem color-mix(in srgb, var(--c-text-inverted), transparent 86%),
				inset 0 1px 0 color-mix(in srgb, white, transparent 68%),
				inset 0 -0.35rem 0.75rem color-mix(in srgb, var(--c-text-inverted), transparent 94%);
			backdrop-filter: blur(0.75rem) saturate(1.2);
			transition:
				transform var(--time-xs) ease-out,
				border-color var(--time-xs) ease-out,
				box-shadow var(--time-xs) ease-out,
				background var(--time-xs) ease-out,
				color var(--time-xs) ease-out;

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				border-radius: inherit;
				background: linear-gradient(
					135deg,
					color-mix(in srgb, white, transparent 74%) 0%,
					transparent 38%,
					color-mix(in srgb, var(--c-text-light), transparent 92%) 100%
				);
				opacity: 0.7;
				pointer-events: none;
			}

			&:hover {
				transform: translateY(-0.1rem) scale(1.035);
				border-color: color-mix(in srgb, var(--c-text-light), transparent 26%);
				background:
					linear-gradient(
						180deg,
						color-mix(in srgb, white, transparent 78%) 0%,
						color-mix(in srgb, var(--c-box-2), transparent 6%) 100%
					),
					radial-gradient(
						circle at 28% 24%,
						color-mix(in srgb, var(--c-text-light), transparent 68%) 0%,
						transparent 42%
					),
					color-mix(in srgb, var(--c-box-3), transparent 6%);
				color: var(--c-text);
				box-shadow:
					0 1rem 2.2rem color-mix(in srgb, var(--c-text-inverted), transparent 82%),
					0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 88%),
					inset 0 1px 0 color-mix(in srgb, white, transparent 62%);
			}

			&:focus-visible {
				outline: none;
				border-color: color-mix(in srgb, var(--c-bullish), var(--c-text-light) 30%);
				box-shadow:
					0 0 0 0.2rem color-mix(in srgb, var(--c-bullish), transparent 82%),
					0 1rem 2.2rem color-mix(in srgb, var(--c-text-inverted), transparent 84%);
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
