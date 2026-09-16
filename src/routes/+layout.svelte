<!--
	Root layout
-->
<script lang="ts">
	import { strategyMicrosite } from '$lib/config';
	import { page } from '$app/state';
	import AppHead from '$lib/header/AppHead.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import AnnouncementBanner from './_components/AnnouncementBanner.svelte';
	import Navbar from '$lib/header/Navbar.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import MaintenanceNotice from './_components/MaintenanceNotice.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/components/css/index.css';

	let { data, children } = $props();
	let { podcastAnnouncementDismissedAt } = $derived(data);
</script>

<AppHead />
<PageLoadProgressBar />
{#if !(page.data.skipNavbar || strategyMicrosite)}
	{#if page.url.pathname !== '/'}
		<AnnouncementBanner dismissedAt={podcastAnnouncementDismissedAt} />
	{/if}
	<Navbar />
{/if}
<MaintenanceNotice />
{@render children()}
{#if !page.data.skipFooter}
	<Footer />
{/if}
<SiteMode />
