<!--
    Test client side backtesting data download.

    Check that preflight requests and HTTP OPTIONS are kosher.

    Test against local backend:

    ```
    export VITE_TRADING_STRATEGY_API_KEY="..."
    export VITE_PUBLIC_BACKEND_URL=http://127.0.0.1:3456/api
    npm run dev
    ````

    Or set the API key locally in the console:


    ```javascript
    window.localStorage.setItem("tsApiKey", "secret-token:tradingstrategy-...");
    ```
-->
<script context="module" lang="ts">
	import { backendUrl } from '$lib/config';

	export let apiKey = import.meta.env.VITE_TRADING_STRATEGY_API_KEY;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import api from './trading-view/api.svelte';

	export let page: number;

	export let apiKey;

	export let motd;

	onMount(async () => {
		if (!apiKey) {
			apiKey = window.localStorage.getItem('tsApiKey');
		}

		const resp = await fetch(`${backendUrl}/message-of-the-day`, {
			headers: new Headers({
				Authorization: apiKey,
				'Content-Type': 'application/json'
			})
		});
		console.log('Resp is', resp);

		const data = await resp.json();
		console.log('Data is', data);

		motd = data.message;
	});
</script>

<div class="container">
	<div class="content">
		<h1>Backtesting dataset download in a browser</h1>

		<p>Testing download datasets using fetch().</p>

		{#if !apiKey}
			<div class="alert alert-danger">
				API key missing. Please run locally and export VITE_TRADING_STRATEGY_API_KEY or set via JavaScript console
				window.localStorage.setItem("tsApiKey", "");
			</div>
		{/if}

		<p>
			API URL is: <strong>{backendUrl}</strong>
		</p>

		<p>
			API key is: <strong>{apiKey}</strong>
		</p>

		<p>
			Message of the day: <strong>{motd}</strong>
		</p>
	</div>
</div>
