<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { PageHeading } from '$lib/components';

	export let data: PageData;

	$: summary = data.summary;
	$: position = data.state?.portfolio?.open_positions[$page.params.position];

	$: console.log(position);
</script>

<main class="ds-container">
	<PageHeading level={2}>
		<h1><a href="/strategies/{summary.id}">{summary.name}</a></h1>
		<h2>Position #{position.position_id}</h2>
	</PageHeading>
</main>
