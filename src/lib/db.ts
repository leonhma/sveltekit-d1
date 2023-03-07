export async function executeQuery(platform: App.Platform, query: string, ...binds: unknown[]) {
	return await platform.env.DATABASE.prepare(query)
		.bind(...binds)
		.all();
}

