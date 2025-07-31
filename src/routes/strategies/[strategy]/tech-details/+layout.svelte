<script lang="ts">
	import { page } from '$app/stores';
	import Menu from '$lib/components/Menu.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';
	import SummaryBox from '$lib/components/SummaryBox.svelte';

	$: currentTab = $page.url.pathname.split('/').at(-1);
</script>

<SummaryBox>
	<header slot="header">
		<Menu horizontal>
			<MenuItem label="Status" targetUrl="status" active={currentTab === 'status'} />
			<MenuItem label="Logs" targetUrl="logs" active={currentTab === 'logs'} />
			<MenuItem label="Analysis" targetUrl="analysis" active={currentTab === 'analysis'} />
			<MenuItem label="Decision making" targetUrl="decision-making" active={currentTab === 'decision-making'} />
		</Menu>
	</header>

	<slot />
</SummaryBox>

<style>
	header {
		@media (--viewport-sm-down) {
			--menu-item-font: var(--f-ui-sm-medium);
			--menu-item-letter-spacing: var(--ls-ui-sm);
		}
	}
</style>
