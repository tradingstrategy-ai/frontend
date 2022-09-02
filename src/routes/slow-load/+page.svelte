<!--
A test endpoint for the page load progress bar. Page load is delayed 2 seconds
by default. Increment the `?page=n` param to delay by n * 2 seconds.
-->
<script context="module" lang="ts">
	export async function load({ url }) {
		const page = parseInt(url.searchParams.get('page')) || 1;
		await new Promise((resolve) => setTimeout(resolve, page * 2000));
		return { props: { page } };
	}
</script>

<script lang="ts">
	export let page: number;
</script>

<svelte:head>
	<title>Developer diagnostics page</title>
	<meta name="description" content="Information about the currently running frontend version" />
</svelte:head>

<div class="container">
	<div class="content">
		<h1>You're on Page {page}.</h1>
		<p>
			In this page's <code>load</code> function, we waited for {page * 2}
			seconds to mimick a real-world API call before rendering. You can go back to the home page, which should load instantaneously
			because it doesn't do much server side. Page 2 (and beyond) will have a longer delay of {(page + 1) * 2} seconds.
		</p>
		<div class="links">
			<a href="/">Home</a>
			<a href="?page={page + 1}">Page {page + 1}</a>
		</div>
	</div>
</div>
