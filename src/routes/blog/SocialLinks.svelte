<script lang="ts">
	import { Button } from '$lib/components';
	import IconNewspaper from '~icons/local/newspaper';
	import IconTwitter from '~icons/local/twitter';
	import IconRss from '~icons/local/rss';
</script>

<div class="social-links">
	<Button label="Subscribe to our Newsletter" href="/newsletter" size="sm">
		<IconNewspaper slot="icon" />
	</Button>
	<Button label="Follow us on Twitter" href="https://twitter.com/TradingProtocol" size="sm">
		<IconTwitter slot="icon" />
	</Button>
	<Button label="RSS Feed" href="/blog/rss.xml" rel="external" size="sm">
		<IconRss slot="icon" />
	</Button>
</div>

<style>
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
	}
</style>
