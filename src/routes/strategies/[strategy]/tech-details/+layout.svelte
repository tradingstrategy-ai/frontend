<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, MenuItem } from '$lib/components';

	$: currentTab = $page.url.pathname.split('/').at(-1);
</script>

<section>
	<Menu horizontal>
		<MenuItem label="Status" targetUrl="status" active={currentTab === 'status'} />
		<MenuItem label="Logs" targetUrl="logs" active={currentTab === 'logs'} />
		<MenuItem label="Decision making" targetUrl="decision-making" active={currentTab === 'decision-making'} />
	</Menu>
	<slot />
</section>
