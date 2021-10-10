
export function formatKilos(n): string {
    if(n <= 1000) {
        return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
    } else{
        return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
    }
}

/**
 *
 * @param n
 */
export function formatSize(n): string {
    if(n <= 1024*1024) {
        return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
    } else{
        return (n/(1024*1024)).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
    }
}

export function formatDownloadLink(validApiKey, key, link) {
    if(!validApiKey) {
        return "javascript:";
    }

    const url = new URL(link);
    url.searchParams.set("api-key", key);
    return url.toString();
}


/**
 * Format large money amounts in human friendly manner.
 *
 * @param n
 * @param minFrag
 * @param maxFrag
 */
export function formatDollar(n: number, minFrag = 3, maxFrag = 3): string {

    if(n === undefined || n === null) {
        // Plz avoid ending here
        return "---";
    }

    if(n >= 1000*1000*1000) {
        return "$" + (n / (1000 * 1000 * 1000)).toLocaleString("en", {
            minimumFractionDigits: minFrag,
            maximumFractionDigits: maxFrag
        }) + "B"
    } else if(n >= 1000*1000) {
        return "$" + (n / (1000 * 1000)).toLocaleString("en", {
            minimumFractionDigits: minFrag,
            maximumFractionDigits: maxFrag
        }) + "M"
    } else if(n >= 1000) {
        return "$" + (n / (1000)).toLocaleString("en", {
            minimumFractionDigits: minFrag,
            maximumFractionDigits: maxFrag
        }) + "k"
    } else {
        return "$" + n.toLocaleString("en", {
            minimumFractionDigits: minFrag,
            maximumFractionDigits: maxFrag
        });
    }
}


export function formatPriceChange(n: number): string {
    return (n > 0 ? "+" : "") + (n * 100).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3}) + "%";
}

// Use a thousand separator
export function formatAmount(n: number): string {

    if(!n) {
        return "---";
    }

    return n.toLocaleString("en");
}

/**
 * Format UNIX timestamp
 * @param ts Timestamp in seconds
 */
export function formatUnixTimestamp(ts: number): string {

    if(!ts) {
        return "---";
    }

    const d = new Date(ts * 1000);
    return d.toUTCString();
}