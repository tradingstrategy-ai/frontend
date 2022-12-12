<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeading } from '$lib/components';

	export let data: PageData;

	const { summary, position, trade } = data;
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1>
			<a href=".">Position #{position.position_id}</a> in
			<a href="/strategies/{summary.id}/">{summary.name}</a>
		</h1>
		<h2>Trade #{trade.trade_id}</h2>
	</PageHeading>
</main>
