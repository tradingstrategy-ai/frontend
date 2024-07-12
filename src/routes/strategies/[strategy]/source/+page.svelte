<!--
	Page to display the source code of the strategy.
-->
<script lang="ts">
	import python from 'svelte-highlight/languages/python';
	import { SourceCode, SummaryBox } from '$lib/components';

	export let data;

	$: ({ strategy, code } = data);

	// Github links disabled as for now they no longer host the canonical source
	// $: githubUrl = `http://github.com/tradingstrategy-ai/trade-executor/tree/master/strategies/${summary.id}.py`;
</script>

<svelte:head>
	<title>Source code | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="The source code of the {strategy.name} strategy" />
</svelte:head>

<section class="source">
	<SummaryBox title="Source code" subtitle="The source code of the {strategy.name} strategy" ctaPosition="top">
		<SourceCode language={python} {code} />
	</SummaryBox>
</section>
