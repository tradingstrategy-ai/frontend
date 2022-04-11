/**
 * A hack to get Twitter to share images from the private blog.
 *
 * WARN:  The image URL https://trading-strategy.ghost.io/content/images/2022/04/marko-pekic-IpLa37Uj2Dw-unsplash-1.jpg specified by the 'twitter:image' metatag may be restricted by the site's robots.txt file, which will prevent Twitter from fetching it.
 *
 * TODO: Fix properly by fixing Ghost?
 */
export async function get({ params }) {
    // https://kit.svelte.dev/docs/routing#advanced-routing-rest-parameters
    const { file } = params;
    console.log("Got file", file);
    const res = await fetch(`https://trading-strategy.ghost.io/${file}`);
    const bin = await res.arrayBuffer();
    console.log("Got body", bin.byteLength);

    // Proxy image to the client
    return {
        headers: { 'content-type': 'image/jpeg' },
        body: new Uint8Array(bin)
    };
}