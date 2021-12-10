<script>
    /**
     * Render blog roll on the homepage.
     */

    import '$lib/styles/price.css';
    import Time from "svelte-time";

    export let posts;

</script>

<div class="home-blogroll">
    <div class="card-deck">
        {#each posts as post}
            <div class="card bg-primary shadow-soft border-light">

                {#if post.feature_image}
                  <a href={`/blog/${post.slug}`}>
                    <img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt}>
                  </a>
                {/if}

                <div class="card-body">

                    <a href={`/blog/${post.slug}`}>
                        <h5 class="h5 card-title">{post.title}</h5>
                    </a>

                    <p class="text-published text-muted text-sm">
                         <Time relative timestamp="{Date.parse(post.published_at)}" />
                    </p>

                    <p class="detail">
                        {post.excerpt}
                    </p>

                </div>

                <div class="card-footer">
                    <a class="btn btn-primary btn-read" href={`/blog/${post.slug}`}>Read post</a>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>

    .card {
        margin-bottom: 20px
    }

    .card-footer {
        text-align: right;
    }

  .text-published {
    font-size: 70%;
    text-transform: uppercase;
  }
</style>