<script lang="ts">
  export let breadcrumbs = [
      { url: '/',  name: 'empty not working', linkActive: false, head: true  },
    ]
</script>

<nav aria-label="breadcrumb breadcrumb-gray" data-test-id="breadcrumb">
  <ol class="breadcrumb breadcrumb-gray" >
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

<style>
  .breadcrumb {
    box-shadow: inset 2px 2px 5px #b8b9be,inset -3px -3px 7px #fff;
    margin: 10px 0;
    padding: 12px 12px;
  }

  .breadcrumb-item,
  .breadcrumb-item a {
    color: #232833;
    font-weight: 300;
    font-size: 0.9rem;
  }

  .breadcrumb-item a {
    font-weight: 500;
  }

  .breadcrumb-item a:hover {
    text-decoration: underline;
  }

</style>
