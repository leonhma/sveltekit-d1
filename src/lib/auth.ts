export async function hash_sha2(text: string) {
    return Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).toString('hex');
}
