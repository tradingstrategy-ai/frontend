<script context="module">

    import { backendUrl } from '$lib/config';
	import {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    /**
     * Display chain information and indexing status
     *
     */

    export async function load({ url, fetch }) {

        // Load and render exchange details on the server side
        // https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
        const apiUrl = `${backendUrl}/chains`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                return;
            } else {
                console.error(resp);
                return {
                    status: resp.status,
                    error: new Error(
                        `Could not load data for the chain details: ${apiUrl}. See console for details.`
                    )
                };
            }
        }

        const chains = await resp.json();

        const breadcrumbs = {
            "trading-view": "Trading data",
			"blockchains": "Blockchains",
        };

        // console.log("Received chains", chains);

        return {
            props: {
                chains,
                breadcrumbs: buildBreadcrumbs(url.pathname, breadcrumbs),
            }
        };
    }
</script>

<script>
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';

	export let chains;
    export let breadcrumbs;

</script>

<svelte:head>
	<title>Blockchain overview</title>
	<meta name="description" content="Supported blockchains" />
</svelte:head>

<div class="container container-main exchanges">

	<Breadcrumb breadcrumbs={breadcrumbs} />

	<div class="row">
		<div class="col-md-12">

			<div class="exchanges-content">
				<h1>Blockchains</h1>

				<p>
					List of currently active blockchains producing trading data. You can explore the blockchains for
					supported decentralised exchanges, trading pairs and price charts.
				</p>

				<table class="table">
					<thead>
						<th>Blockchain</th>
						<th>Exchanges</th>
						<th><!-- actions --></th>
					</thead>

					{#each chains as chain}
						<tr>
							<td>
								<a class="chain-img-link" href={`/trading-view/${chain.chain_slug}`}>
									<img alt={`${chain.chain_name} logo`} class="chain-logo" src={chain.chain_logo} />
								</a>
								<a class="chain-link" href={`/trading-view/${chain.chain_slug}`}>
									{chain.chain_name}
								</a>
							</td>
							<td>
								{chain.exchanges}
							</td>

							<td>
								<a class="chain-link" href={`/trading-view/${chain.chain_slug}`}>
									Details
								</a>
							</td>

						</tr>
					{/each}
				</table>

			</div>

		</div>
	</div>
</div>

<style>
	.chain-logo {
		max-width: 24px;
		max-height: 24px;
	}

	.chain-img-link {
		min-width: 32px;
		text-align: center;
		display: inline-block;
	}

	.chain-link {
		font-weight: 500;
	}

	.chain-link:hover {
		text-decoration: underline;
	}

</style>