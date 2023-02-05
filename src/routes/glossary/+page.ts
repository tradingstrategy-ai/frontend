/**
 * Data loader for glossary index page.
 */

/** @type {import('./$types').PageLoad} */
export async function load({fetch, url}) {

  const resp = await fetch("/glossary/api");
  const glossary = await resp.json()

  return {
    glossary
  }
}
