<script>
    export let title;
    export let description;
    export let tradesOn;
    export let learnLink;
    export let preview;
</script>

<div class="card bg-primary shadow-soft border-light">
    <div class="card-body">
        <h3 class="h5 card-title">{ title }</h3>

        <p class="card-text">
            { description }
        </p>

        <p class="info">Currently invested: <span class="badge text-uppercase">Coming soon</span></p>

        <p class="info">
            Trades on: <span class="data">{ tradesOn }</span>
        </p>

        <div class="buttons">
            {#if learnLink}
                <a rel="external" href="https://tradingstrategy.ai/docs/programming/algorithms/double-7.html" class="btn btn-primary">
                    Learn more
                </a>
            {:else}
                <button class="btn" disabled>
                    Learn more
                </button>
            {/if}

            <button class="btn" disabled>
                Invest now
            </button>
        </div>
    </div>

</div>

<style>
    .info {
        font-size: 80%;
        font-weight: bold;
    }

    .data {
        font-weight: normal;
    }

    .buttons {
        text-align: right;
    }

    .btn {
        margin-left: 10px;
    }
</style>