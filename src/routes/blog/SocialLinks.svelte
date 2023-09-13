<script lang="ts">
	import { Button } from '$lib/components';
</script>

<div class="social-links">
	<Button icon="newspaper" label="Subscribe to our Newsletter" href="/newsletter" size="sm" />
	<Button icon="twitter" label="Follow us on Twitter" href="https://twitter.com/TradingProtocol" size="sm" />
	<Button icon="rss" label="RSS Feed" href="/blog/rss.xml" rel="external" size="sm" />
</div>

<style lang="postcss">
	.social-links {
		column-gap: var(--space-md);
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: var(--justify-content, flex-start);
		gap: var(--space-md);

		@media (--viewport-sm-down) {
			flex-direction: column;
		}

		:global .button {
			--icon-size: 1.125rem !important;
		}
	}
</style>
