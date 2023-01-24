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

		<a title="Newsletter" href="/newsletter">
			<SocialIcon name="newspaper" />
		</a>

		<a href="/blog/rss.xml" rel="external" title="RSS">
			<SocialIcon name="rss" />
		</a>
	{/if}
</footer>

<style lang="postcss">
	footer {
		--footer-height: 12rem;

		@media (--nav-collapsed) {
			--footer-height: 6rem;
		}

		display: grid;
		grid-auto-flow: column;
		place-content: center;
		gap: 2.5rem;
		height: var(--footer-height);

		@media (--viewport-sm-down) {
			gap: var(--space-ls);
			padding: 2.5rem var(--space-md);
		}

		&.small {
			--social-icon-size: 44px;
			gap: var(--space-ls);
			padding: 0;
		}
	}

	a,
	button {
		transition: opacity 0.15s;
		border: none;
		background: transparent;

		&:hover {
			opacity: 0.9;
			cursor: pointer;
		}
	}
</style>
