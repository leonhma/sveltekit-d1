import { bufferToHex, hash_sha2 } from '$lib/auth';
import { executeQuery } from '$lib/db';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, cookies }) => {
    if (!platform) throw error(500, 'No platform in worker');

	let user = cookies.get('user');
	let token = cookies.get('token');
	console.log(user, token)
	if (!user || !token) {
		user = crypto.randomUUID();
		token = bufferToHex(crypto.getRandomValues(new Uint8Array(32)).buffer);
		console.log(token, await hash_sha2(token));
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

	const { results } = await executeQuery(
		platform,
		'select number from users where user = ?1 and token = ?2',
		user,
		await hash_sha2(token)
	);

	if (!results || !results.length) throw error(404, 'No user in database');

	console.log(results)
	console.log(results[0])
	console.log(JSON.stringify(results[0]))
	return new Response(JSON.stringify(results[0]));
};
