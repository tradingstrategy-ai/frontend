interface Post {
  title: string,
  author: string,
  published_at: Date,
  updated_at: string
}

export function serializePost(postData: Post) {
    const metadata = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "headline": postData.title,
      "author": {
          "@type": "Person",
          "name": "tradingstrategy.ai"
      },
      "datePublished": postData.published_at,
      "dateModified": postData.updated_at,
    }

    return `<script type="application/ld+json">${JSON.stringify(metadata, null, 2)}</script>`
}
