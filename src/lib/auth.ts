export async function hash_sha2(text: string) {
    return new TextDecoder().decode(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}
