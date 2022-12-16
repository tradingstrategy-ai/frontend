<!--
	Page to display the source code of the strategy.
	TODO: Add nice source code formatting widget
-->
<script lang="ts">
	import type { PageData } from './$types';
	import SourceCode from './SourceCode.svelte';
	import { SummaryBox } from '$lib/components';

	export let data: PageData;

	$: summary = data.summary;

	// Currently loaded source code
	$: source = data.source;

	// TODO: Hack for now, have metadata object to expose real strategy canocical source code URLs
	$: githubUrl = `http://github.com/tradingstrategy-ai/trade-executor/tree/master/strategies/${summary.id}.py`;
</script>

<section class="source">
	<SummaryBox
		title="Source code"
		subtitle="The source code of the {summary.name} strategy"
	</div>
	>
		<SourceCode {source} />
	</SummaryBox>
</section>

<style lang="postcss">
	div {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		margin-bottom: 0.25rem;
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing);
	}

	a {
		font-weight: 700;
		text-decoration: underline;
	}
</style>
