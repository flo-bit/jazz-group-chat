<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { Message, Thread } from '$lib/schema';
	import { Button } from '@fuxui/base';
	import { useCurrentRoute } from '$lib/context';
	import { CoState } from 'jazz-svelte';

	const route = useCurrentRoute();

	let {
		threadId,
		lastReadDate,
		onclick,
		onlyShowIfRecent = false,
		channelId
	}: {
		threadId: string;
		lastReadDate?: Date;
		onclick?: () => void;
		onlyShowIfRecent?: boolean;
		channelId?: string;
	} = $props();

	let thread = $derived(new CoState(Thread, threadId));
	let lastMessage = $derived(
		new CoState(Message, thread.current?.timeline?.at(-1), {
			resolve: {
				content: true,
				images: true,
				reactions: true
			}
		})
	);

	let isNew = $derived.by(() => {
		if (!lastReadDate) return thread.current?.timeline?.length !== 0;
		if (!thread.current?.timeline) return false;
		let date = lastMessage?.current?.createdAt;
		if (!date) return false;

		return new Date(lastReadDate) < date;
	});

	// is latest message less tha 24 hours old
	let isRecent = $derived.by(() => {
		if (!thread.current?.timeline) return false;
		let date = lastMessage?.current?.createdAt;
		if (!date) return false;
		return date.getTime() > Date.now() - 1000 * 60 * 60 * 24;
	});
</script>

{#if isNew || (!onlyShowIfRecent || isRecent)}
	<div class="w-full pl-4">
		<Button
			data-current={page.url.pathname ===
				`/${route.spaceId}/channel/${channelId ?? route.channelId}/thread/${threadId}`}
			variant="ghost"
			href="/{route.spaceId}/channel/{channelId ?? route.channelId}/thread/{threadId}"
			class="relative w-full justify-start backdrop-blur-none"
			{onclick}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
				><path
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4.5 7.5h12c1.886 0 2.828 0 3.414.586s.586 1.528.586 3.414v1m-4-2h-12m12 3h-12m12 3h-12m11 3h-10a2 2 0 0 0-2 2h14a2 2 0 0 0-2-2m-10-15h10a2 2 0 0 0 2-2h-14a2 2 0 0 0 2 2"
					color="currentColor"
				/></svg
			>

			{thread.current?.name}
			{#if isNew}
				<div class="absolute top-1 left-1">
					<div class="bg-accent-500 dark:bg-accent-600 size-2 rounded-full"></div>
				</div>
			{/if}
		</Button>
	</div>
{/if}
