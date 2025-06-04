<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { Channel, Message } from '$lib/schema';
	import { Button } from '@fuxui/base';
	import type { Loaded } from 'jazz-tools';
	import { useCurrentRoute } from '$lib/context';
	import { afterNavigate, goto } from '$app/navigation';
	import { CoState } from 'jazz-svelte';

	const route = useCurrentRoute();

	let {
		channel,
		lastReadDate,
		onclick
	}: {
		channel: Loaded<typeof Channel>;
		lastReadDate?: Date;
		onclick?: () => void;
	} = $props();

	let lastMessage = $derived(
		new CoState(Message, channel.mainThread?.timeline?.at(-1), {
			resolve: {
				content: true,
				images: true,
				reactions: true
			}
		})
	);

	let isNew = $derived.by(() => {
		if (!lastReadDate) return channel.mainThread?.timeline?.length !== 0;
		if (!channel.mainThread?.timeline) return false;
		let date = lastMessage?.current?.createdAt;
		if (!date) return false;

		return new Date(lastReadDate) < date;
	});
</script>

<Button
	data-current={page.url.pathname === `/${route.spaceId}/channel/${channel.id}`}
	variant="ghost"
	href="/{route.spaceId}/channel/{channel.id}"
	class="relative w-full justify-start backdrop-blur-none"
	{onclick}
	onmousedown={() => {
		goto(`/${route.spaceId}/channel/${channel.id}`);
	}}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="1.5"
		stroke="currentColor"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5"
		/>
	</svg>

	{channel.name}
	{#if isNew}
		<div class="absolute top-1 left-1">
			<div class="bg-accent-500 dark:bg-accent-600 size-2 rounded-full"></div>
		</div>
	{/if}
</Button>
