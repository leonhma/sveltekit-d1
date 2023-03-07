import { hash_sha2 } from '$lib/auth';
import { executeQuery } from '$lib/db';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, cookies, request }) => {
	console.log(platform)
	if (!platform) throw error(500, 'No platform in worker');
	if (!cookies) throw error(404, 'No cookies present');
	if (!request.body) throw error(404, 'No body in request');


	const user = cookies.get('user');
	const token = cookies.get('token');
	if (!user || !token) throw error(404, 'No user or token in cookies');

	const { success } = await executeQuery(
		platform,
		'update users set number = ?3 where user = ?1 and token = ?2',
		user,
		hash_sha2(token),
		parseInt(JSON.parse(request.body.getReader.toString()).number)
	);

	if (!success) throw error(500, 'Failed to update number');
	return new Response('OK');
};
