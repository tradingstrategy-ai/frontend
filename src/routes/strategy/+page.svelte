<script lang="ts">
	import type { PageData } from './$types';
	import { StrategySummaryPage } from 'trade-executor-frontend';

	export let data: PageData;
</script>

<StrategySummaryPage strategies={data.strategies} />
