interface Post {
  title: string,
  author: string,
  datePublished: Date,
  dateModified: string
}

export function serializePost(postData: Post) {
    const metadata = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "headline": postData.title,
      "author": {
          "@type": "Person",
          "name": postData.author
      },
      "datePublished": postData.datePublished,
      "dateModified": postData.dateModified,
    }

    return `<script type="application/ld+json">${JSON.stringify(metadata, null, 2)}</script>`
}
