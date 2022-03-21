<script context="module">
  import ghostClient from "$lib/blog/client";

  const limit = 15;

  async function fetchPosts(page = { next: 1 }) {
    if (!page.next) return { page, posts: [] };
    const response = await ghostClient?.posts.browse({ limit, page: page.next });
    return {
      posts: [...response],
      page: response.meta.pagination
    };
  }

  export async function load() {
    return {
      props: await fetchPosts()
    };
  }
</script>

<script>
  import Time from "svelte-time";
  import Sidebar from "$lib/blog/Sidebar.svelte";
  import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';

  export let posts = [];
  export let page = {};

  async function fetchNextPage() {
    page.loading = true;
    const response = await fetchPosts(page);
    posts = [...posts, ...response.posts];
    page = response.page;
  }
</script>

<svelte:head>
    <title>Blog</title>
    <meta name="description" content="Latest on algorithmic trading">
</svelte:head>


<div class="container">

  <div class="section-blog-roll">
    <div class="row">
      <div class="col-md-12">
        <h1>Trading Strategy blog</h1>

        <p class="lead">
          Follow our decentralised algorithmic trading protocol development.
        </p>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-9 col-md-12">
        {#each posts as post}

          <div class="card bg-primary border-light shadow-soft card-post">

            {#if post.feature_image}
              <a href={`/blog/${post.slug}`}>
                <img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt}>
              </a>
            {/if}

            <div class="card-body">

              <h5 class="card-title">
                <a href={`/blog/${post.slug}`}>
                  {post.title}
                </a>
              </h5>

              <p class="text-published text-muted text-sm">
                {new Date(post.published_at).toDateString()} Published: <Time relative timestamp="{Date.parse(post.published_at)}" />
              </p>

              <p class="card-text">
                {post.excerpt}
              </p>

              <a class="btn btn-primary btn-sm btn-read" href={`/blog/${post.slug}`}>Read post</a>
            </div>

          </div>
        {:else}
          <p>
            No blog posts found (check if Ghost is properly configured)
          </p>
        {/each}

        <p class="text-center font-weight-bolder">
          {#if page.loading}
            <Spinner />
          {:else if page.next}
            <div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
          {:else}
            Congratulations – you've reached the end 🎉! Check back soon for new posts.
          {/if}
        </p>
      </div>

      <div class="col-lg-3 col-md-12">
        <Sidebar />
      </div>
    </div>
  </div>
</div>

<style>

  .section-blog-roll {
    margin: 60px 0;
  }

  .card {
    margin-bottom: 60px;
  }

  .card-img-top {
    max-height: 220px;
    object-fit: cover;
  }

  .text-published {
    font-size: 70%;
    text-transform: uppercase;
  }

  .btn-read {
    float: right;
  }
</style>
