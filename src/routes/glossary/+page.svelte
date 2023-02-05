<script lang="ts">
	import type { PageData } from './$types';
    import {first} from "cheerio/lib/api/traversing";

	export let data: PageData;

	let { glossary } = data;

    function buildIndex(glossary) {
      let index: Record<string, string[]>;
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
    <h1>Trading and DeFi terminology</h1>

    <p>
        Glossary for technical trading and decentralised finance.
    </p>

    {#each index as terms }
        <h2>{index}</h2>

    {/each}
</main>