// https://stackoverflow.com/questions/68479217/how-to-load-environment-variables-in-svelte
export const backendUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL;

if(!backendUrl) {
    throw new Error("VITE_PUBLIC_BACKEND_URL missing");
}

if(backendUrl.endsWith("/")) {
    throw new Error(`Backend URL cannot end with slash: ${backendUrl}`);
}