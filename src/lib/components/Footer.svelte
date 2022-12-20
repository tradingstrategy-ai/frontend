<script>
	import { SocialIcon } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';

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

		<button title="Newsletter" on:click={toggleSubscribeDialog}>
			<SocialIcon name="newspaper" />
		</button>

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
			gap: 1.25rem;
			padding: 2.5rem 1rem;
		}

		&.small {
			--social-icon-size: 44px;
			gap: 1.25rem;
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
