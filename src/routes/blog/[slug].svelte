<script context="module">
  import { getGhostCredentials } from "$lib/config";

  // Ghost client
  import GhostContentAPI from '@tryghost/content-api'

  // Pure server-side rendered page - no interactive JS
  import { dev } from "$app/env";
  import {buildBreadcrumbs} from "$lib/breadcrumb/builder";

  export async function load({ url, params, fetch }) {
      const ghostKeys = getGhostCredentials();

      const api = new GhostContentAPI({
        url: ghostKeys.apiUrl,
        key: ghostKeys.contentApiKey,
        version: "v3"
      });

      const slug = params.slug;

      // See post data model
      // https://ghost.org/docs/content-api/#posts
      const post = await api.posts.read({ slug: slug}, { formats: ['html']});

      // console.log("Got post", slug, post);

      if(!post) {
        // Explicit 404
        return;
      }

      const readableNames = {
            "blog": "Blog",
      };
      readableNames[slug] = post.title;

      return {
          props: {
              post,
              breadcrumbs: buildBreadcrumbs(url.pathname, readableNames),
          }
      }

  }

</script>

<script>
  import Time from "svelte-time";
  import {onMount, afterUpdate} from "svelte";
  import Sidebar from "$lib/blog/Sidebar.svelte";
  import Breadcrumb from "$lib/breadcrumb/Breadcrumb.svelte";

  // TODO: Mobile menu requires hydrate
  // This will prevent any interactive JavaScript to load on blog (as there should be none)
  export const hydrate = true;

  // https://stackoverflow.com/a/57377341/315168
  function wrapResponsive(el) {
      const wrapper = document.createElement('div');
      wrapper.className = "table-responsive"
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
      console.log("Wrapped table", el);
  }

  // Our blog posts contain links to /docs
  // Svelte internal router will try to intercept links in the blog posts
  // and gives 404 because docs are not Svelte pages.
  // This fixes this - and makes all links on the blog post to behave external.
  function fixLink(el) {
    el.setAttribute("rel", "external");
  }

  export let post;
  export let breadcrumbs;

  // Make tables mobile friendly by wrapping them with the Bootstrap responsible table handling
  onMount(() => {
      // TODO: Run this on parsed HTML feed from Ghost.io, not on the live document
      document.querySelectorAll('.body-text .table').forEach(function (elem) {
          wrapResponsive(elem);
      });

      document.querySelectorAll('.body-text a').forEach(function (elem) {
          fixLink(elem);
      });
  });

</script>

<svelte:head>
    <title>{post.title}</title>
    <meta name="description" content={post.excerpt}>
</svelte:head>


<section class="heading" style={`background-image: url(${post.feature_image})`}>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1>{post.title}</h1>
            </div>
        </div>
    </div>
</section>


<div class="container">
  <div class="section-post">

    <div class="row">
      <div class="col-lg-9 col-md-12">
        <!--
        <h1>{ post.title }</h1>
        -->

        <p class="text-published text-muted text-sm">
          Published: <Time relative timestamp="{Date.parse(post.published_at)}" />.
        </p>

        <div class="body-text">
          { @html post.html}
        </div>

      </div>

      <div class="col-lg-3 col-md-12">
        <Sidebar />
      </div>
    </div>
  </div>
</div>

<style>

  .container-breadcrumb :global(.breadcrumb) {
      margin: 40px 0 0 0;
  }

  .heading {
    min-height: 200px;
    padding: 80px 0;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat
  }

  .heading h1 {
    color: white;
    text-transform: none;
    font-size: 120%;
    text-shadow: 0 0 3px black;
    text-align: center;
  }

  .section-post {
    margin: 40px 0;
  }

  .text-published {
    font-size: 70%;
    text-transform: uppercase;
  }

  .body-text :global(.kg-image) {
    margin: 20px 0;
    /* Fix explicit width and height attributes on <img> in Ghost HTML export */
    width: auto;
    height: auto;
    max-width: 100%;
  }

  .body-text :global(a) {
    border-bottom: 1px solid black;
  }

  .body-text :global(figcaption) {
    font-size: 80%;
    font-style: italic;
    font-weight: bold;
    color: #888;
    text-align: center;
    margin-bottom: 20px;
  }

  .body-text :global(iframe) {
    border: 0;
    width: 100%;
    min-height: 450px;
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