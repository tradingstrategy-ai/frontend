// https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte
export const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;

if(!backendUrl) {
    throw new Error("VITE_PUBLIC_BACKEND_URL missing");
}

if(backendUrl.endsWith("/")) {
    throw new Error(`Backend URL cannot end with slash: ${backendUrl}`);
}


/**
 * Load Ghost API credentials and loudly bark if they are not available.
 */
export function getGhostCredentials() {
    const keys = {
        contentApiKey: import.meta.env.VITE_PUBLIC_GHOST_CONTENT_API_KEY,
        apiUrl: import.meta.env.VITE_PUBLIC_GHOST_API_URL,
    }

    if(!keys.contentApiKey || !keys.apiUrl) {
        throw new Error("You need configure Ghost API keys to render the blog");
    }

    return keys;
}

/**
 * Load Typesense config options and warn if not available.
 */
export const typesenseConfig = ((env) => {
    const apiKey = env.VITE_PUBLIC_TYPESENSE_API_KEY;
    const host = env.VITE_PUBLIC_TYPESENSE_HOST;
    if (!(apiKey && host)) {
        console.warn("You need to configure Typesense options to enable search");
    }
    return { apiKey, host };
})(import.meta.env);

// Add some site features depending if we run prod, staging or local dev
export const siteMode = import.meta.env.VITE_SITE_MODE || 'local';

if(!(siteMode == 'production' || siteMode == 'staging' || siteMode == 'local')) {
    throw new Error(`Bad site mode ${siteMode}`);
}