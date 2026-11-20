# DataForSEO keyword and SERP data

[`scripts/seo-dataforseo.mjs`](../scripts/seo-dataforseo.mjs) (`pnpm run seo:dataforseo <command>`) pulls data from the [DataForSEO](https://dataforseo.com/) API that Search Console cannot provide. Search Console only reports queries where tradingstrategy.ai already gets impressions; DataForSEO also covers queries we do not rank for yet and shows who ranks instead.

| Command                       | Endpoint                                     | What it answers                                                                                       |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `balance`                     | `appendix/user_data`                         | Do the credentials work, and how much credit is left (free)                                           |
| `volume [keyword…]`           | `dataforseo_labs/google/keyword_overview`    | Search volume, difficulty and intent for every term in `seo-target-terms.json`, or the given keywords |
| `serp`                        | `serp/google/organic/live/regular`           | Our live Google position for each category term (or `--query`), and the top 3 domains                 |
| `ranked [domain] [--match w]` | `dataforseo_labs/google/ranked_keywords`     | Keywords a domain ranks for, optionally only those containing a word; finds the keyword gap           |
| `ideas <seed…>`               | `dataforseo_labs/google/keyword_suggestions` | Longer phrases containing each seed, by search volume                                                 |

`volume` and `serp` reuse [`scripts/seo-target-terms.json`](../scripts/seo-target-terms.json), the same query set as `pnpm run seo:search-console terms`, so the two reports line up. Results default to the United States in English; pass `--location-code` and `--language` for other markets.

## Reading the results

- Volumes are Google Ads estimates for one country (US by default). This niche is small: most vault phrases show no US volume although Search Console records global impressions for them, so do not drop a term on volume alone.
- Google serves organic links as `google.com/goto?url=…` redirects, which DataForSEO passes through as the result URL. `serp` reads the site from the displayed breadcrumb instead; video and social results have no breadcrumb and show as "(no site shown)", and the page path of a result is approximate.
- Check what a keyword means before targeting it: "apollo vaults" (1,000/month) is Fallout game searches.
- Labs ranking data (`ranked`) lags: it may report a URL that now redirects.

## Cost

Every command except `balance` is billed per request to the prepaid DataForSEO balance, and the script prints the cost reported by the API after each run. `serp` makes one request per query, and a larger `--depth` costs more. See the [pricing page](https://app.dataforseo.com/pricing) for current rates. For scale, on 2026-11-20: `volume` for 38 terms $0.014, `serp --depth 20` for 28 terms $0.10, `ranked` $0.013–0.019, `ideas` for nine seeds $0.13.

## Credentials

Add to `.env.local` (gitignored). These are the API credentials from [API Access](https://app.dataforseo.com/api-access), not the account sign-in password:

```env
TS_PRIVATE_DATAFORSEO_LOGIN="<api-login>"
TS_PRIVATE_DATAFORSEO_PASSWORD="<api-password>"
```

New accounts must verify their email address before the API returns data.
