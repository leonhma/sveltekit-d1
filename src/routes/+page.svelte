<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	$: fetch('/api/set', {
		method: 'POST',
		body: JSON.stringify({ number: data.number })
	})
		.then((res) => res.json())
		.then((res) => {
			data.status = res.status;
		});
</script>

<p>Status: {data.status}</p>
<input type="range" min="0" max="100" value={data.number} />
