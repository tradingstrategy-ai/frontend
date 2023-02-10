// See https://navillus.dev/blog/json-ld-in-sveltekit
export function serializeSchema(thing: object): string {
    return `<script type="application/ld+json">${JSON.stringify(thing)}</script>`;
}