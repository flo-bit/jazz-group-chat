<script lang="ts">
	import '../app.css';

	import { Head, Toaster } from '@fuxui/base';
	import { JazzProvider } from 'jazz-svelte';
	import { MyAppAccount } from '$lib/schema';
	import { dev } from '$app/environment';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';

	let { children } = $props();

	let route = $state({
		spaceId: page.params.spaceId,
		channelId: page.params.channelId,
		threadId: page.params.threadId
	});

	setContext('route', route);

	afterNavigate(() => {
		route.spaceId = page.params.spaceId;
		route.channelId = page.params.channelId;
		route.threadId = page.params.threadId;
	});
</script>

<JazzProvider
	sync={{
		peer: `wss://cloud.jazz.tools/?key=flo.bit.dev@gmail.com`
	}}
	AccountSchema={MyAppAccount}
>
	{@render children()}
</JazzProvider>

<Toaster />

<Head title="jazz group chat" emojiFavicon={dev ? '🔥' : '💬'} />
