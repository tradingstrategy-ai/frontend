export function formatNumber(n) {
    if(n <= 1000) {
        return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
    } else{
        return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
    }
}

export function formatSize(n) {
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


export function formatDollar(n: number): string {

    if(n === undefined) {
        // Plz avoid ending here
        return "---";
    }

    if(n >= 1000*1000*1000) {
        return "$" + (n / (1000 * 1000 * 1000)).toLocaleString("en", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }) + "B"
    } else if(n >= 1000*1000) {
        return "$" + (n / (1000 * 1000 * 1000)).toLocaleString("en", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }) + "M"
    } else {
        return "$" + n.toLocaleString("en", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        });
    }
}


export function formatPriceChange(n: number): string {
    return (n * 100).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3}) + "%";
}

// Use a thousand separator
export function formatAmount(n: number): string {
    return n.toLocaleString("en");
}