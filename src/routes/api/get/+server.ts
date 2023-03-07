import { hash_sha2 } from '$lib/auth';
import { executeQuery } from '$lib/db';
import { error, type RequestHandler } from '@sveltejs/kit';



export const POST: RequestHandler = async ({ platform, cookies }) => {
	if (!platform) throw error(501, 'No platform in worker');

	let user = cookies.get('user');
    let token = cookies.get('token');
	if (!user || !token) {
		user = crypto.randomUUID();
		token = new TextDecoder().decode(crypto.getRandomValues(new Uint8Array(32)));
		await executeQuery(
			platform,
			'insert into users (user, token, number) values (?1, ?2, ?3)',
			user,
            hash_sha2(token),
            0
		).then((res) => {
			if (!res.success) throw error(502, 'Failed to insert user into database');
		});
		cookies.set('user', user);
		cookies.set('token', token);
	}

    const { results } = await executeQuery(platform, 'select number from users where user = ?1 and token = ?2', user, hash_sha2(token));
    console.log(results)

	if (!results) throw error(404, 'No user in database');

    return new Response(JSON.stringify({ number: results[0] }));
};
