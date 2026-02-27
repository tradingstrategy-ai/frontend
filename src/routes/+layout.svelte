<!--
	Root layout
-->
<script lang="ts">
	import { announcement, strategyMicrosite } from '$lib/config';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { beforeNavigate } from '$app/navigation';
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

	/**
	 * Lazily load fonts as per issue 9.
	 *
	 * See also app.html for <body> <script> handle.
	 *
	 * - https://github.com/tradingstrategy-ai/design-system/issues/9
	 * - https://kit.svelte.dev/docs/modules#$app-navigation-beforenavigation
	 *
	 * To test this set `fontWarmup` to `false` in dev console:
	 *
	 * ```javascript
	 * window.localStorage.setItem("fontWarmup", "false");
	 * ```
	 */
	function toggleFontLoad() {
		if (browser) {
			const fontStylesheet = document.getElementById('font-stylesheet');
			if (fontStylesheet) {
				fontStylesheet.setAttribute('rel', 'stylesheet');
			}
		}
	}

	beforeNavigate((navigation) => {
		toggleFontLoad();
	});
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
