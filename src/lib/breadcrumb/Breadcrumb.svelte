<script lang="ts">
  /**
   *
   * Render the top breadcrumbs path bar.
   *
   * For Google breadcrumbs SEO metadata see
   *
   * https://developers.google.com/search/docs/data-types/breadcrumbs
   */
  export let breadcrumbs = [
      { url: '/',  name: 'empty not working', linkActive: false, head: true  },
    ]
</script>

<nav aria-label="breadcrumb breadcrumb-gray" data-test-id="breadcrumb">
  <ol class="breadcrumb breadcrumb-gray" itemscope itemtype="http://schema.org/BreadcrumbList">
    {#each breadcrumbs  as breadcrumb, i}
      <li class="breadcrumb-item" itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
        {#if breadcrumb.head || !breadcrumb.url }
            <span itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
              <span itemprop="name">
                {breadcrumb.name}
              </span>
            </span>
        {:else}
          {#if breadcrumb.linkActive}
            <a itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
              <span itemprop="name">
                {breadcrumb.name}
              </span>
            </a>
          {:else}
            <span itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
              <span itemprop="name">
                {breadcrumb.name}
              </span>
            </span>
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
    background: var(--soft);
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
