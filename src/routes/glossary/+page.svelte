<!-- Render the glossary index page with a link to the each term -->
<script lang="ts">
	import type { PageData } from './$types';

    import Section from '$lib/components/Section.svelte';

	export let data: PageData;

	let { glossary } = data;

  console.log(glossary);

    function buildIndex(glossary) {
      let index: Record<string, string[]> = {};
      for(const [key, value] of Object.entries(glossary)) {
        const firstLetter = key[0];
        if(!index[firstLetter]) {
          index[firstLetter] = [];
        }
        index[firstLetter].push(value);
      }
      return index;
    }

    const index = buildIndex(glossary);
</script>

<svelte:head>
	<title>Technical trading term glossary</title>
	<meta name="description" content="What do technical trading terms mean?" />
</svelte:head>

<main>
    <section>
        <h1>Technical trading and decentralised finance glossary</h1>

        <p>
            Explanations for technical trading and decentralised finance terms.
        </p>

        {#each Object.entries(index) as [letter, terms] }
            <div class="index-letter">
                <h2>{letter.toUpperCase()}</h2>
                {#each terms as term}
                    <a class="term" href={`/glossary/${term.slug}`}>
                        {term.name}
                    </a>
                {/each}
            </div>
        {/each}
    </section>
</main>

<style>

    main {
        margin: var(--space-md);
    }

    section {
		max-width: var(--container-max-width);
		margin: auto;
    }

    .index-letter {
        width: 300px;
        display: inline-block;
        padding: 0 var(--space-md) var(--space-md) 0;
        vertical-align: top;
    }

    .term {
        display: block;
    }

</style>