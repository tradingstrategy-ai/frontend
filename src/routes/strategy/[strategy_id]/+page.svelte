<script lang="ts">
	import type { PageData } from './$types';
	import { StrategyOverviewPage } from 'trade-executor-frontend';

	export let data: PageData;
</script>

<StrategyOverviewPage metadata={data} />
