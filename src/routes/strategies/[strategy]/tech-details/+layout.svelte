<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, MenuItem, SummaryBox } from '$lib/components';

	$: currentTab = $page.url.pathname.split('/').at(-1);
</script>

<SummaryBox>
	<header slot="header">
		<Menu horizontal>
			<MenuItem label="Status" targetUrl="status" active={currentTab === 'status'} />
			<MenuItem label="Logs" targetUrl="logs" active={currentTab === 'logs'} />
			<MenuItem label="Decision making" targetUrl="decision-making" active={currentTab === 'decision-making'} />
		</Menu>
	</header>

	<slot />
</SummaryBox>

<style lang="postcss">
	header {
		@media (--viewport-sm-down) {
			--menu-item-font: var(--f-ui-sm-medium);
			--menu-item-letter-spacing: var(--ls-ui-sm);
		}
	}
</style>
