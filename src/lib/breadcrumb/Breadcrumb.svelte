<script contecxt module lang="ts">
  import {browser} from "$app/env";
  import { onMount } from "svelte";

  export let breadcrumbs = [
      { url: '/',  name: 'empty not working', linkActive: false, head: true  },
    ]
</script>

<nav aria-label="breadcrumb">
  <ol class="breadcrumb breadcrumb-gray">
    {#each breadcrumbs  as breadcrumb, i}
      <li class="breadcrumb-item">
        {#if breadcrumb.head || !breadcrumb.url }
          {breadcrumb.name}
        {:else}
          {#if breadcrumb.linkActive}
            <a href={breadcrumb.url}> {breadcrumb.name} </a>
          {:else}
            {breadcrumb.name}
          {/if}
        {/if}
      </li>
    {/each}
  </ol>
</nav>