import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    return await fetch('/api/get', {method: 'POST'}).then(async (r) => await r.json())
};
