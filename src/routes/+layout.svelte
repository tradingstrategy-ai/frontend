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
	import { setViewportHeight } from '$lib/actions/viewport';
	import '$lib/components/css/index.css';

	let { data, children } = $props();
	let { podcastAnnouncementDismissedAt } = $derived(data);
</script>

<svelte:body use:setViewportHeight />

<AppHead />
<PageLoadProgressBar />
{#if !(page.data.skipNavbar || strategyMicrosite)}
	<div class="site-header">
		{#if page.url.pathname !== '/'}
			<AnnouncementBanner dismissedAt={podcastAnnouncementDismissedAt} />
		{/if}
		<Navbar />
	</div>
{/if}
<MaintenanceNotice />
{@render children()}
{#if !page.data.skipFooter}
	<Footer />
{/if}
<SiteMode />

<style>
	.site-header {
		display: flex;
		flex-direction: column;

		/* On phones the navigation comes first and the announcement sits below it */
		@media (--viewport-sm-down) {
			:global(.announcement-banner) {
				order: 1;
			}
		}
	}
</style>
