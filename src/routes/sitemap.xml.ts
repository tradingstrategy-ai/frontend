// sitemap.xml generation


// This sitemap is manually maintained and page paths included here one by one
const staticPages = [
    "",
    "about",
    "trading-view",
    "trading-view/backtesting",
    "community",
    "trading-view/exchanges",
    "trading-view/blockchains",
]


/***
 * Sitemap.xml HTTP GET endpoint
 *
 * For more information see https://stackoverflow.com/a/69523302/315168
 */
export async function get(page) {

  // Generate the sitemap.xml file with string fiddling
  const fragments = [];
  for(let path of staticPages) {
    const fullUrl = `${page.host}/${path}`;
    fragments.push(`<url><loc>${fullUrl}</loc></url>`);
  }

  // Build the XML for pages
  const urlXml = "".concat(...fragments);

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
    headers: {
      'Content-Type': 'application/xml'
    }
  }
}