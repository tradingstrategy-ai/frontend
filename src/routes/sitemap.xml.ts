/**
 * sitemap.xml generation
 */

// This sitemap is manually maintained and page paths included here one by one
const staticPages = [
    "",
    "about",
    "trading-view",
    "trading-view/backtesting",
    "trading-view/exchanges",
    "trading-view/api",
    "trading-view/binance/tokens",
    "trading-view/polygon/tokens",
    "trading-view/ethereum/tokens",
    "trading-view/blockchains",
    "trading-view/trading-pairs",
    "trading-view/top-list",
    "trading-view/top-list/daily-up",
    "trading-view/top-list/daily-down",
    "api/explorer/",
    "docs",
    "blog",
    "community",
    "search",

    // refer to other sitemaps
    "blog/rss.xml",
    "docs/sitemap.xml",
    "api/sitemap/pairs/paged/0.xml",
    "api/sitemap/pairs/paged/1.xml",
    "api/sitemap/pairs/paged/2.xml",
    "api/sitemap/exchanges/sitemap.xml",
]


/***
 * Sitemap.xml HTTP GET endpoint.
 *
 * Generates a sitemap for static pages and other sitemaps.
 *
 * For more information see https://stackoverflow.com/a/69523302/315168
 *
 * @type {import('@sveltejs/kit').RequestHandler}
 *
 */
export async function get({ url }) {

    console.log("Downloading sitemap for", url);

    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const proto = url.protocol;

    let host = url.host;
    if(!host || host === "undefined") {
      // TODO: No idea why we are getting "undefined" as string on the production server
      // throw new Error(`Sitemap generator did not get host: ${url}`);
      host = "tradingstrategy.ai";
    }

    // Generate the sitemap.xml file with string fiddling
    const fragments = [];
    for(let path of staticPages) {
    const fullUrl = `${proto}//${host}/${path}`;
        fragments.push(`<url><loc>${fullUrl}</loc></url>`);
    }

    // Build the XML for pages
    const urlXml = "".concat(...fragments);

    // See https://en.wikipedia.org/wiki/Sitemaps
    const xml =
    `<?xml version="1.0" encoding="utf-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
        ${urlXml}
    </urlset>`

    return {
        status: 200,
        body: xml,
        //https://stackoverflow.com/questions/3272534/what-content-type-value-should-i-send-for-my-xml-sitemap
        headers: {
          'Content-Type': 'application/xml'
        }
    }
}