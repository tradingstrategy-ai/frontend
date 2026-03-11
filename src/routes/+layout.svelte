<!--
	Root layout
-->
<script lang="ts">
	import { announcement, strategyMicrosite } from '$lib/config';
	import { page } from '$app/stores';
	import AppHead from '$lib/header/AppHead.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import AnnouncementBanner from './_components/AnnouncementBanner.svelte';
	import Navbar from '$lib/header/Navbar.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import MaintenanceNotice from './_components/MaintenanceNotice.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { setViewportHeight } from '$lib/actions/viewport';
	import '$lib/components/css/index.css';

	export let data;
	const { announcementDismissedAt } = data;
</script>

<svelte:body use:setViewportHeight />

<AppHead />
<PageLoadProgressBar />
{#if !($page.data.skipNavbar || strategyMicrosite)}
	{#if announcement}
		<AnnouncementBanner {...announcement} dismissedAt={announcementDismissedAt} />
	{/if}
	<Navbar />
{/if}
<MaintenanceNotice />
<slot />
{#if !$page.data.skipFooter}
	<Footer />
{/if}
<SiteMode />
