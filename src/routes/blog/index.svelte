<script context="module">
  import { getGhostCredentials } from "$lib/config";

  // Ghost client
  import GhostContentAPI from '@tryghost/content-api'

  let ghostKeys = null;

  export async function load({ page, fetch, session, stuff }) {
      ghostKeys = getGhostCredentials();

      const api = new GhostContentAPI({
        url: ghostKeys.apiUrl,
        key: ghostKeys.contentApiKey,
        version: "v3"
      });

      // https://morioh.com/p/a655d08860dd
      const postIndexFields = [
        'id',
        'uuid',
        'title',
        'slug',
        'feature_image',
        'feature_image_alt',
        'published_at',
        //'html',
        'excerpt'
      ]


      // See post data model
      // https://ghost.org/docs/content-api/#posts
      const posts = await api.posts.browse();

      console.log("Got posts", posts);

      return {
          props: {
              posts
          }
      }

  }

</script>

<script>
  import Time from "svelte-time";

  export let posts;
</script>

<div class="container">

  <div class="row">
    <div class="col-md-12">
      <h1>Trading Strategy blog</h1>

      <p class="lead">
        Follow the protocol development.
      </p>
    </div>
  </div>

  <div class="row">
    <div class="col-md-12">
      {#each posts as post}

        <div class="card bg-primary border-light shadow-soft card-post">

          {#if post.feature_image}
            <img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt}>
          {/if}

          <div class="card-body">

            <h5 class="card-title">{post.title}</h5>

            <p>
              Published <Time relative timestamp="{Date.parse(post.published_at)}" />
            </p>

            <p class="card-text">
              {post.excerpt}
            </p>
          </div>

          <a class="btn btn-primart btn-sm" href={`/blog/${post.slug}`}>Read post</a>

        </div>
      {/each}
    </div>
  </div>
</div>
