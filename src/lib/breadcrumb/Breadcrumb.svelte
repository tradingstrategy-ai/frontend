<script context="module" lang="ts">
  export let breadcrumbs = [
      { url: '/',  name: 'empty not working', linkActive: false, head: true  },
    ]
</script>

<nav aria-label="breadcrumb shadow-none" data-test-id="breadcrumb">
  <ol class="breadcrumb breadcrumb-gray  shadow-none" >
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
