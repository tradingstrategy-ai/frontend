<!--

    Page to display the source code of the strategy.

    TODO: Add nice source code formatting widget
-->
<script lang="ts">
	import type { PageData } from './$types';
	import SourceCode from './SourceCode.svelte';
	import { currentStrategy } from 'trade-executor-frontend/state/store';

	export let data: PageData;

	// Currently loaded source code
	$: source = data.source;

	// TODO: Hack for now, have metadata object to expose real strategy canocical source code URLs
	$: githubUrl =
		`http://github.com/tradingstrategy-ai/trade-executor/tree/master/strategies/` + $currentStrategy.id + `.py`;
</script>

<p>
	The source code of the {$currentStrategy.name} strategy.
	<a class="body-link" href={githubUrl}>View source code on Github.</a>
</p>

<SourceCode {source} />
