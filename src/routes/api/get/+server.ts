import { get_credentials, hash_sha2 } from '$lib/auth';
import { executeQuery } from '$lib/db';
import type { D1Result } from '@cloudflare/workers-types';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, cookies }) => {
	if (!platform) throw error(500, 'No platform in worker');

	const { user, token } = await get_credentials(platform, cookies);

	const { results } = (await executeQuery(
		platform,
		'select number from users where user = ?1 and token = ?2',
		user,
		await hash_sha2(token)
	)) as D1Result<{ number: number }>;

	if (!results || !results.length) throw error(404, 'No user in database');

	return new Response(JSON.stringify(results[0]));
};
