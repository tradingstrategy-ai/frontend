<!--
	Page to display the source code of the strategy.
	TODO: Add nice source code formatting widget
-->
<script lang="ts">
	import type { PageData } from './$types';
	import python from 'svelte-highlight/languages/python';
	import { Button, SourceCode, SummaryBox } from '$lib/components';

	export let data: PageData;

	$: summary = data.summary;

	// Currently loaded source code
	$: code = data.source;

	// TODO: Hack for now, have metadata object to expose real strategy canocical source code URLs
	$: githubUrl = `http://github.com/tradingstrategy-ai/trade-executor/tree/master/strategies/${summary.id}.py`;
</script>

<section class="source">
	<SummaryBox title="Source code" subtitle="The source code of the {summary.name} strategy">
		<Button slot="headerCta" tertiary icon="github" href={githubUrl} label="View on GitHub" target="_blank" />
		<SourceCode language={python} {code} />
		<Button slot="footerCta" tertiary icon="github" href={githubUrl} label="View on GitHub" target="_blank" />
	</SummaryBox>
</section>
