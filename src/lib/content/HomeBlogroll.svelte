<script>
    /**
     * Render blog roll on the homepage.
     */


    import Time from "svelte-time";

    export let posts;

</script>

<div class="home-blogroll">
    <div class="card-deck"><!-- wrap every 2 on sm-->
        {#each posts as post}
            <div class="card bg-primary shadow-soft border-light">

                {#if post.feature_image}
                  <a href={`/blog/${post.slug}`}>
                    <img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt} width=489 height=200>
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

    /*
        This will cause cumulative layout shift event after the image is loaded, but
        it really does not matter if the image is not in the initial viewport (top of o the page).
        We will just use this to get rid of CLS warning on pagespeed.web.dev:

            Image elements do not have explicit width and height

        One could get rid of the CLS events by setting the min-height for the
        container element that contains the image - in our case <a>,
        and have few height pixels of background coloured playground to make everything aligned.
        However, this would need to be tailored to every mobile breakpoint in the layout.

    */
    .card-img-top {
        height: auto;
    }

   /* Make sure we do not get too narrow cards on tablet screens */
   @media (max-width: 992px) {
       .card-deck {
           display: block; /* Remove flex layout from card-deck */
       }
   }

  .text-published {
    font-size: 70%;
    text-transform: uppercase;
  }

</style>
