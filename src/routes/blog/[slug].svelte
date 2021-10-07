<script context="module">
  import { getGhostCredentials } from "$lib/config";

  // Ghost client
  import GhostContentAPI from '@tryghost/content-api'

  // Pure server-side rendered page - no interactive JS
  export const hydrate = false;

  export async function load({ page, fetch, session, stuff }) {
      const ghostKeys = getGhostCredentials();

      const api = new GhostContentAPI({
        url: ghostKeys.apiUrl,
        key: ghostKeys.contentApiKey,
        version: "v3"
      });

      const slug = page.params.slug;

      // See post data model
      // https://ghost.org/docs/content-api/#posts
      const post = await api.posts.read({ slug: slug}, { formats: ['html']});

      // console.log("Got post", slug, post);

      if(!post) {
        // Explicit 404
        return;
      }

      return {
          props: {
              post,
          }
      }

  }

</script>

<script>
  import Time from "svelte-time";
  import {onMount} from "svelte";
  import {browser} from "$app/env";

  // https://stackoverflow.com/a/57377341/315168
  function wrap(el, wrapper) {
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
  }

  export let post;

    onMount(async () => {
      const wrapper = document.createElement('div');
      wrapper.className = "table-responsive"
      document.querySelectorAll('.body-text .table').forEach(function(elem) {
        wrap(elem, wrapper);
      })
    });

</script>

<div class="container">

  <div class="section-post">
    <div class="row">
      <div class="col-md-8">
        <h1>{ post.title }</h1>

        <div class="body-text">
          { @html post.html}
        </div>

      </div>
    </div>
  </div>
</div>

<style>

  .section-post {
    margin: 60px 0;
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