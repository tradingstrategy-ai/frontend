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
  import Sidebar from "$lib/blog/Sidebar.svelte";
  import BlogPreviewCard from "$lib/blog/BlogPreviewCard.svelte"
  import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';

  export let posts = [];
  export let page = {};

  async function fetchNextPage() {
    page.loading = true;
    try {
      const response = await fetchPosts(page);
      posts = [...posts, ...response.posts];
      page = response.page;
    } catch(e) {
      page.error = e.message;
      page.loading = false;
    }
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
        {#each posts as post (post.id)}
          <BlogPreviewCard {post} layout="full" />
        {:else}
          <p>
            No blog posts found (check if Ghost is properly configured)
          </p>
        {/each}

        <div class="text-center font-weight-bolder">
          {#if page.loading}
            <Spinner />
          {:else if page.error}
            Error loading blog posts:
            <pre class="font-weight-normal">{page.error}</pre>
          {:else if page.next}
            <div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
          {:else}
            Congratulations – you've reached the end 🎉! Check back soon for new posts.
          {/if}
        </div>
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
</style>
