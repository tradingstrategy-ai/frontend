<script>

    import polygon from '$lib/assets/logos/polygon.svg';
    import oneinch from '$lib/assets/logos/1inch.svg';

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

        <p class="info">
            Trades on: <strong><img src={oneinch} width=24 height=24> 1inch on <img src={polygon} width=24 height=24> Polygon</strong>
        </p>

        <p class="info">
            Historical return: <span class="data">21%</span>
        </p>


        <div class="buttons">
            <a href="/strategy/ethlisbon" class="btn btn-secondary">
                View demo
            </a>
        </div>
    </div>

</div>

<style>

    .card {
        background: linear-gradient( rgba(0,0,0,.5), rgba(0,0,0,.5) ), url(../assets/ethlisbon.webp);
        color: white;
        font-weight: bold;
    }

    @media (max-width: 992px) {
        /* Optimize mobile loading time */
        .card {
            background: blue !important;
        }
    }

    h3 {
        color: white;
    }

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
        color: white;
        box-shadow: 3px 3px 6px #005, -3px -3px 6px #005;
        background: #E4B645;
    }

    .btn:hover {
        background: blue;
    }

</style>