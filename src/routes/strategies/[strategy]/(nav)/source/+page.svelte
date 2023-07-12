<!--
	Page to display the source code of the strategy.
-->
<script lang="ts">
	import python from 'svelte-highlight/languages/python';
	import { SourceCode, SummaryBox } from '$lib/components';

	export let data;

	$: ({ summary, code } = data);

	// Github links disabled as for now they no longer host the canonical source
	// $: githubUrl = `http://github.com/tradingstrategy-ai/trade-executor/tree/master/strategies/${summary.id}.py`;
</script>

<section class="source">
	<SummaryBox title="Source code" subtitle="The source code of the {summary.name} strategy" ctaPosition="top">
		<!--
		<Button
			slot="cta"
			let:position
			size={position === 'header' ? 'sm' : 'md'}
			tertiary
			icon="github"
			href={githubUrl}
			label="View on GitHub"
			target="_blank"
		-->
		<SourceCode language={python} {code} />
	</SummaryBox>
</section>
