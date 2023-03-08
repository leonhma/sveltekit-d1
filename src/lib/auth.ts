import type { D1Result } from '@cloudflare/workers-types';
import { error, type Cookies } from '@sveltejs/kit';
import { Buffer } from 'buffer/';
import { executeQuery } from './db';

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
	return bufferToHex(await crypto.subtle.digest('SHA-256', hexToBuffer(text)));
}

export async function get_credentials(platform: App.Platform, cookies: Cookies): Promise<{user: string, token: string}> {
	let authenticated = true;

	let user = cookies.get('user');
	let token = cookies.get('token');

	if (!user || !token) {
		console.log('no auth');
		authenticated = false;
	} else {
		console.log('checking for valid auth');
		const { results } = (await executeQuery(
			platform,
			'select number from users where user = ?1 and token = ?2',
			user,
			await hash_sha2(token)
		)) as D1Result<{ number: number }>;

		if (!results || !results.length) {
			authenticated = false;
		}
	}

	if (!authenticated) {
		console.log('creating new auth');
		user = crypto.randomUUID();
		token = bufferToHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
		await executeQuery(
			platform,
			'insert into users (user, token, number) values (?1, ?2, ?3)',
			user,
			await hash_sha2(token),
			0
		).then((res) => {
			if (!res.success) throw error(500, 'Failed to insert user into database');
		});
		cookies.set('user', user);
		cookies.set('token', token);
	}

	return {user: user as string, token: token as string}
}
