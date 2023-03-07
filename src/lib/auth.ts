import { Buffer } from "buffer/"

export function bufferToHex(buffer: ArrayBuffer): string {
	return Array.prototype.map
		.call(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0'))
		.join('');
}

export function hexToBuffer(hex: string): ArrayBuffer {
	if (hex.length % 2 != 0) {
		throw new TypeError('Expecting an even number of characters in the hexString');
	}

	const bad = hex.match(/[G-Z\s]{2}/gi);

	if (bad) {
		throw new TypeError(`Found non-hex characters [${bad.join()}]`);
	}

	const pairs = hex.match(/[\dA-F]{2}/gi);
	const integers = pairs?.map((s) => parseInt(s, 16));
	const array = new Uint8Array(integers ?? []);

	return array.buffer;
}

export async function hash_sha2(text: string) {
	return bufferToHex(
		await crypto.subtle.digest('SHA-256', hexToBuffer(text))
	);
}
