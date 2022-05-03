/**
 * Token standard naming helper
 */


// chain_slug -> standard name
export const TOKEN_STANDARDS = {
    "ethereum": "ERC-20",
    "binance": "BEP-20",
    "polygon": "MAT-20",
}


export function getTokenStandardName(chainSlug: string) {
    return TOKEN_STANDARDS[chainSlug];
}